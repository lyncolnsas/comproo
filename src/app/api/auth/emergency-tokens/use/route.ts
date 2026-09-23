/**
 * POST /api/auth/emergency-tokens/use
 * Utiliza um token offline/emergência para fazer login quando o WhatsApp estiver offline ou indisponível
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/jwt';
import { loginRateLimiter } from '@/lib/rate-limiter';
import { validateAndConsumeEmergencyToken } from '@/lib/emergency-tokens';
import { isVpsMode } from '@/lib/domain';

export async function POST(request: Request) {
  const clientIp = loginRateLimiter.getClientIp(request);

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.token !== 'string' || typeof body.username !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Usuário e token de emergência são obrigatórios.' },
        { status: 400 }
      );
    }

    const { token, username } = body;
    const cleanUsername = username.trim();

    // Rate limiting para tokens de emergência (previne tentativa de adivinhação de tokens)
    const rateStatus = loginRateLimiter.checkCompound(clientIp, `emergency:${cleanUsername}`);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Muitas tentativas com token incorreto. Bloqueado por ${Math.ceil(rateStatus.retryAfterSeconds / 60)} minuto(s).`,
        },
        { status: 429 }
      );
    }

    const validation = await validateAndConsumeEmergencyToken(token, clientIp);

    if (!validation.valid) {
      loginRateLimiter.recordFailure(clientIp, `emergency:${cleanUsername}`);
      console.warn(`[EMERGENCY LOGIN FAILED] Token inválido usado por IP ${clientIp} para o usuário ${cleanUsername}`);
      return NextResponse.json(
        { success: false, message: 'Token de emergência inválido ou já utilizado.' },
        { status: 401 }
      );
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Sucesso: limpa os contadores de falhas
    loginRateLimiter.recordSuccess(clientIp, cleanUsername);
    loginRateLimiter.recordSuccess(clientIp, `emergency:${cleanUsername}`);

    console.log(`[EMERGENCY LOGIN SUCCESS] Usuário '${cleanUsername}' autenticado com token offline de emergência! IP: ${clientIp}`);

    const isHttps =
      request.url.startsWith('https://') ||
      request.headers.get('x-forwarded-proto') === 'https' ||
      isVpsMode();

    const jwtToken = await signJwt({
      username: user.username,
      name: user.name || 'Admin',
      role: user.role || 'ADMIN',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Autenticado com sucesso via Token de Emergência!',
      name: user.name || user.username,
    });

    response.cookies.set('system_auth', jwtToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 horas
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[EMERGENCY LOGIN ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno durante autenticação de emergência.' },
      { status: 500 }
    );
  }
}
