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

    // Try to remove from MikroTik before deleting in DB
    try {
      const { MikrotikAPI } = await import('@/lib/routeros');
      const activeRouter = await prisma.router.findFirst({ where: { active: true } });
      if (activeRouter) {
        const mk = new MikrotikAPI();
        const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
        if (connected) {
          const payments = await prisma.payment.findMany({ where: { leadId: id } });
          const lead = await prisma.hotspotLead.findUnique({ where: { id } });
          const usersToRemove = new Set<string>();
          if (lead) usersToRemove.add(lead.hotspotUser);
          payments.forEach(p => { if (p.isVoucher && p.voucherCode) usersToRemove.add(p.voucherCode); });

          const mkUsers = await mk.getHotspotUsers() as any[];
          for (const username of Array.from(usersToRemove)) {
             const found = mkUsers.find(u => u['name'] === username);
             if (found) {
               const uid = found['.id'] || found['id'];
               await mk.removeHotspotUser(uid).catch(() => {});
             }
          }
          mk.disconnect();
        }
      }
    } catch(e) {
      console.error('Mikrotik removal failed, continuing DB delete', e);
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
