import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';
import { signCustomerJwt } from '@/lib/jwt';
import { customerRateLimiter } from '@/lib/rate-limiter';
import { timingSafeCompare, dummyVerifyPassword } from '@/lib/auth-crypto';
import { isVpsMode } from '@/lib/domain';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const clientIp = customerRateLimiter.getClientIp(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { username, password, whatsapp } = body;

    const accountIdentifier = (whatsapp || username || '').trim();

    // 1. Proteção de Rate Limiting
    const rateStatus = customerRateLimiter.checkCompound(clientIp, accountIdentifier);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Muitas tentativas incorretas. Tente novamente em ${Math.ceil(
            rateStatus.retryAfterSeconds / 60
          )} minuto(s).`,
        },
        { status: 429 }
      );
    }

    let lead = null;

    if (whatsapp) {
      // Login via WhatsApp number
      const rawDigits = whatsapp.replace(/\D/g, '');
      if (!rawDigits) {
        return NextResponse.json(
          { success: false, message: 'Informe um número de WhatsApp válido.' },
          { status: 400 }
        );
      }

      const without55 = rawDigits.startsWith('55') && rawDigits.length > 10 ? rawDigits.slice(2) : rawDigits;
      const with55 = rawDigits.startsWith('55') ? rawDigits : `55${rawDigits}`;
      const candidates = Array.from(new Set([rawDigits, without55, with55])).filter(Boolean);

      // Search across whatsappNumber, phone, and hotspotUser
      const orConditions: any[] = candidates.flatMap(num => [
        { whatsappNumber: { contains: num } },
        { phone: { contains: num } },
        { hotspotUser: num },
        { hotspotUser: { contains: num } },
      ]);

      lead = await prisma.hotspotLead.findFirst({
        where: { OR: orConditions },
        orderBy: { createdAt: 'desc' },
      });

      // Fallback: search by core subscriber number (last 8-9 digits)
      if (!lead && without55.length >= 8) {
        const core8 = without55.slice(-8);
        const core9 = without55.length >= 9 ? without55.slice(-9) : core8;
        lead = await prisma.hotspotLead.findFirst({
          where: {
            OR: [
              { whatsappNumber: { contains: core8 } },
              { whatsappNumber: { contains: core9 } },
              { phone: { contains: core8 } },
              { phone: { contains: core9 } },
              { hotspotUser: { contains: core8 } },
              { hotspotUser: { contains: core9 } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!lead) {
        customerRateLimiter.recordFailure(clientIp, accountIdentifier);
        return NextResponse.json(
          { success: false, message: 'Número de WhatsApp não encontrado. Por favor, realize o cadastro primeiro.' },
          { status: 404 }
        );
      }

      customerRateLimiter.recordSuccess(clientIp, accountIdentifier);
    } else if (username && password) {
      // Login via hotspot credentials
      lead = await prisma.hotspotLead.findFirst({
        where: { hotspotUser: username },
      });

      // Fallback: username might be phone / whatsapp
      if (!lead) {
        const rawDigits = username.replace(/\D/g, '');
        if (rawDigits.length >= 8) {
          const core = rawDigits.slice(-8);
          lead = await prisma.hotspotLead.findFirst({
            where: {
              OR: [
                { phone: { contains: rawDigits } },
                { whatsappNumber: { contains: rawDigits } },
                { phone: { contains: core } },
                { whatsappNumber: { contains: core } },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });
        }
      }

      if (!lead) {
        dummyVerifyPassword(password);
        customerRateLimiter.recordFailure(clientIp, accountIdentifier);
        return NextResponse.json(
          { success: false, message: 'Usuário não encontrado.' },
          { status: 404 }
        );
      }

      if (lead.password && !timingSafeCompare(lead.password, password)) {
        customerRateLimiter.recordFailure(clientIp, accountIdentifier);
        return NextResponse.json(
          { success: false, message: 'Senha incorreta.' },
          { status: 401 }
        );
      }

      customerRateLimiter.recordSuccess(clientIp, accountIdentifier);
    } else {
      return NextResponse.json(
        { success: false, message: 'Forneça (username + password) ou número de WhatsApp.' },
        { status: 400 }
      );
    }

    // Fetch vouchers — wrapped in try/catch to stay resilient if Prisma client is stale
    let vouchers: any[] = [];
    try {
      vouchers = await (prisma.payment as any).findMany({
        where: { leadId: lead.id, isVoucher: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          amount: true,
          profile: true,
          voucherCode: true,
          isVoucher: true,
          giftTo: true,
          uptimeLimit: true,
          voucherActivatedAt: true,
          pixQrCodeBase64: true,
          pixPayload: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (vErr) {
      console.error('[portal/login] Failed to load vouchers (schema mismatch?), returning empty:', vErr);
      vouchers = [];
    }

    // Assina token JWT criptografado para o cookie portal_session
    const customerToken = await signCustomerJwt({
      leadId: lead.id,
      phone: lead.whatsappNumber || lead.phone,
      hotspotUser: lead.hotspotUser,
    });

    const isHttps =
      request.url.startsWith('https://') ||
      request.headers.get('x-forwarded-proto') === 'https' ||
      isVpsMode();

    const response = NextResponse.json({
      success: true,
      data: {
        id: lead.id,
        name: lead.name,
        hotspotUser: lead.hotspotUser,
        whatsappNumber: lead.whatsappNumber || lead.phone,
        vouchers,
      },
    });

    // Injeta o cookie portal_session com token assinado
    response.cookies.set('portal_session', customerToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: '/',
    });

    // Limpeza de regra temporária de WhatsApp (failsafe além do script nativo on-login do MikroTik)
    (async () => {
      try {
        const lastPayment = await prisma.payment.findFirst({
          where: { leadId: lead.id, macAddress: { not: null } },
          orderBy: { createdAt: 'desc' }
        });
        const clientMac = lastPayment?.macAddress;
        if (clientMac) {
          const activeRouter = await prisma.router.findFirst({ where: { active: true } });
          if (activeRouter) {
            const mk = new MikrotikAPI();
            if (await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port)) {
              await mk.removeTempWhatsAppAccess(clientMac);
              mk.disconnect();
            }
          }
        }
      } catch (cleanErr) {
        console.warn('[portal/customer/login] Erro na limpeza secundária de regra Temp WhatsApp:', cleanErr);
      }
    })();

    return response;
  } catch (error: any) {
    console.error('[portal/customer/login] Error:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}

