import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const leads = await prisma.hotspotLead.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { hotspotUser: { contains: search } },
          { whatsappNumber: { contains: search } },
        ]
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      await prisma.payment.deleteMany({});
      await prisma.hotspotLead.deleteMany({});
      return NextResponse.json({ success: true, message: 'Todos os leads foram excluídos com sucesso.' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do lead não fornecido.' }, { status: 400 });
    }

    // Delete associated payments first to maintain foreign key integrity
    await prisma.payment.deleteMany({ where: { leadId: id } });
    await prisma.hotspotLead.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Lead excluído com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao deletar lead:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao deletar lead' }, { status: 500 });
  }
}
