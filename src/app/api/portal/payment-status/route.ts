import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pixId = searchParams.get('pixId');
    const paymentId = searchParams.get('paymentId');

    if (!pixId && !paymentId) {
      return NextResponse.json({ success: false, message: 'pixId ou paymentId é obrigatório' }, { status: 400 });
    }

    const whereClause: any = pixId ? { pixId: String(pixId) } : { id: String(paymentId) };

    const payment = await prisma.payment.findFirst({
      where: whereClause,
      select: {
        id: true,
        pixId: true,
        status: true,
        amount: true,
        profile: true,
        updatedAt: true
      }
    });

    if (!payment) {
      return NextResponse.json({ success: false, message: 'Pagamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        pixId: payment.pixId,
        status: payment.status,
        isApproved: payment.status === 'approved',
        amount: payment.amount,
        profile: payment.profile,
        updatedAt: payment.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Erro ao consultar status do pagamento:', error);
    return NextResponse.json({ success: false, message: 'Erro interno ao consultar status' }, { status: 500 });
  }
}
