import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ success: false, message: 'paymentId obrigatório.' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        status: true,
        amount: true,
        profile: true,
        voucherCode: true,
        giftTo: true,
        uptimeLimit: true,
        voucherActivatedAt: true,
        createdAt: true,
        updatedAt: true,
        lead: {
          select: {
            name: true,
            hotspotUser: true,
            whatsappNumber: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, message: 'Voucher não encontrado.' }, { status: 404 });
    }

    const isApproved = payment.status === 'approved';

    // Calculate remaining time if voucher is activated
    let remainingSeconds: number | null = null;
    if (isApproved && payment.voucherActivatedAt && payment.uptimeLimit) {
      const totalSeconds = parseUptimeToSeconds(payment.uptimeLimit);
      const elapsed = Math.floor((Date.now() - new Date(payment.voucherActivatedAt).getTime()) / 1000);
      remainingSeconds = Math.max(0, totalSeconds - elapsed);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        isApproved,
        amount: payment.amount,
        profile: payment.profile,
        voucherCode: isApproved ? payment.voucherCode : null,
        giftTo: payment.giftTo,
        uptimeLimit: payment.uptimeLimit,
        voucherActivatedAt: payment.voucherActivatedAt,
        remainingSeconds,
        lead: payment.lead,
      },
    });
  } catch (error: any) {
    console.error('[portal/customer/voucher-status] Error:', error);
    return NextResponse.json({ success: false, message: 'Erro interno.' }, { status: 500 });
  }
}

function parseUptimeToSeconds(uptime: string): number {
  // Formats: "01:00:00" (HH:MM:SS), "1d 00:00:00", "7d 00:00:00"
  const dayMatch = uptime.match(/(\d+)d\s+(\d+):(\d+):(\d+)/);
  if (dayMatch) {
    const [, d, h, m, s] = dayMatch.map(Number);
    return d * 86400 + h * 3600 + m * 60 + s;
  }
  const timeMatch = uptime.match(/(\d+):(\d+):(\d+)/);
  if (timeMatch) {
    const [, h, m, s] = timeMatch.map(Number);
    return h * 3600 + m * 60 + s;
  }
  return 0;
}
