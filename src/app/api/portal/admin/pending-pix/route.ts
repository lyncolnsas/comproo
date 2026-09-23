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

    // 2. Fetch pending manual pix payments
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'pending',
        pixId: {
          startsWith: 'MANUAL_',
        },
      },
      include: {
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mapped = pendingPayments.map(p => ({
      id: p.id,
      date: p.createdAt,
      formattedDate: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
      }).format(new Date(p.createdAt)),
      username: p.lead.hotspotUser,
      clientName: p.lead.name || p.lead.hotspotUser,
      clientPhone: p.lead.phone || p.lead.whatsappNumber || '',
      plan: p.profile || 'Plano de Acesso',
      amount: p.amount,
      pixId: p.pixId,
      pixPayload: p.pixPayload || '',
      giftTo: p.giftTo || null,
      isVoucher: p.isVoucher || false,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error('[portal/admin/pending-pix] Error:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar pagamentos pendentes' }, { status: 500 });
  }
}
