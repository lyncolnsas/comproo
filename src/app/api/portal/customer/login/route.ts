import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, whatsapp } = body;

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
        return NextResponse.json(
          { success: false, message: 'Número de WhatsApp não encontrado. Por favor, realize o cadastro primeiro.' },
          { status: 404 }
        );
      }
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
        return NextResponse.json(
          { success: false, message: 'Usuário não encontrado.' },
          { status: 404 }
        );
      }
      if (lead.password && lead.password !== password) {
        return NextResponse.json(
          { success: false, message: 'Senha incorreta.' },
          { status: 401 }
        );
      }
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

    // Cookie path '/' so it is sent to all routes including /api/*
    response.cookies.set('portal_session', lead.id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24h
    });

    return response;
  } catch (error: any) {
    console.error('[portal/customer/login] Error:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}
