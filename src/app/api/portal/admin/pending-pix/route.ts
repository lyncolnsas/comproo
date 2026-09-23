import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    // 1. Verify admin auth
    const cookieStore = await cookies();
    const token = cookieStore.get('system_auth')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // 2. Fetch ALL pending payments (manual PIX + Mercado Pago + vouchers)
    //    Exclude PREVIEW_ and FREE_ which are test/event-mode entries
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'pending',
        NOT: [
          { pixId: { startsWith: 'PREVIEW_' } },
          { pixId: { startsWith: 'FREE_' } },
        ],
      },
      include: {
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mapped = pendingPayments.map(p => {
      // Determine payment type for UI display
      const isManualPix = p.pixId?.startsWith('MANUAL_') ?? false;
      const isMercadoPago = !isManualPix && !!p.pixId && !isNaN(Number(p.pixId));
      
      return {
        id: p.id,
        date: p.createdAt,
        formattedDate: new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
        }).format(new Date(p.createdAt)),
        username: p.lead.hotspotUser,
        clientName: p.lead.name || p.lead.hotspotUser,
        clientPhone: p.lead.phone || p.lead.whatsappNumber || '',
        clientCpf: p.lead.cpf || '',
        plan: p.profile || 'Plano de Acesso',
        amount: p.amount,
        pixId: p.pixId,
        pixPayload: p.pixPayload || '',
        giftTo: (p as any).giftTo || null,
        isVoucher: (p as any).isVoucher || false,
        isManualPix,
        isMercadoPago,
        // Tipo legível para o admin
        paymentType: isManualPix ? 'manual' : isMercadoPago ? 'mercadopago' : 'other',
        macAddress: p.macAddress || null,
      };
    });

    // Separate into groups for easier UI rendering
    const manualPix = mapped.filter(p => p.isManualPix);
    const mpPending = mapped.filter(p => p.isMercadoPago);
    const otherPending = mapped.filter(p => !p.isManualPix && !p.isMercadoPago);

    return NextResponse.json({
      success: true,
      data: mapped,          // all items together for backward compat
      grouped: {
        manual: manualPix,       // requires admin approval
        mercadopago: mpPending,  // waiting webhook / auto-confirm
        other: otherPending,
      },
      counts: {
        total: mapped.length,
        manual: manualPix.length,
        mercadopago: mpPending.length,
      }
    });
  } catch (error: any) {
    console.error('[portal/admin/pending-pix] Error:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar pagamentos pendentes' }, { status: 500 });
  }
}
