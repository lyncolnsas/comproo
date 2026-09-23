/**
 * POST /api/auth/otp/verify
 * Etapa 2 do 2FA: valida o código OTP recebido via WhatsApp e emite o cookie JWT.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/jwt';
import { loginRateLimiter } from '@/lib/rate-limiter';
import { validateAdminOtp } from '@/lib/admin-otp';
import { isVpsMode } from '@/lib/domain';

export async function POST(request: Request) {
  const clientIp = loginRateLimiter.getClientIp(request);

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.code !== 'string' || typeof body.username !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Código e usuário são obrigatórios.' },
        { status: 400 }
      );
    }

    const { code, username } = body;
    const cleanUsername = username.trim();

    // Rate limiting simples para o endpoint de OTP (evita enumeration por força bruta)
    const rateStatus = loginRateLimiter.checkCompound(clientIp, `otp:${cleanUsername}`);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Muitas tentativas. Tente novamente em ${Math.ceil(rateStatus.retryAfterSeconds / 60)} minuto(s).`,
        },
        { status: 429 }
      );
    }

    // Valida o OTP
    const result = await validateAdminOtp(code);

    if (!result.valid) {
      loginRateLimiter.recordFailure(clientIp, `otp:${cleanUsername}`);

      const messages: Record<string, string> = {
        not_found: 'Código inválido. Verifique o código enviado ao seu WhatsApp.',
        expired: 'Código expirado. Faça login novamente para receber um novo código.',
        already_used: 'Código já utilizado. Faça login novamente para receber um novo código.',
      };

      console.warn(`[OTP VERIFY FAILED] Motivo: ${result.reason} | IP: ${clientIp} | Usuário: ${cleanUsername}`);

      return NextResponse.json(
        { success: false, message: messages[result.reason] ?? 'Código inválido.' },
        { status: 401 }
      );
    }

    // OTP válido: busca o usuário para montar o JWT
    const user = await prisma.user.findUnique({ where: { username: cleanUsername } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Sessão inválida. Faça login novamente.' },
        { status: 401 }
      );
    }

    // Emite o cookie JWT
    loginRateLimiter.recordSuccess(clientIp, cleanUsername);
    loginRateLimiter.recordSuccess(clientIp, `otp:${cleanUsername}`);

    console.log(`[OTP VERIFY SUCCESS] Usuário '${cleanUsername}' autenticado via 2FA. IP: ${clientIp}`);

    const isHttps =
      request.url.startsWith('https://') ||
      request.headers.get('x-forwarded-proto') === 'https' ||
      isVpsMode();

    const token = await signJwt({
      username: user.username,
      name: user.name || 'Admin',
      role: user.role || 'ADMIN',
    });

    const response = NextResponse.json({
      success: true,
      name: user.name || user.username,
    });

    response.cookies.set('system_auth', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 horas
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[OTP VERIFY UNHANDLED ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno. Tente novamente.' },
      { status: 500 }
    );
  }
}
