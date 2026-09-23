import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('system_auth')?.value;
    if (!token) return false;
    const payload = await verifyJwt(token);
    return !!payload;
  } catch {
    return false;
  }
}

/**
 * GET /api/portal/admin/leads
 * Lista clientes cadastrados com status de carência e pagamento.
 * Filtra por ?search=CPF|telefone ou ?blocked=true (apenas com carência bloqueada)
 */
export async function GET(request: Request) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() || '';
  const onlyBlocked = searchParams.get('blocked') === 'true';

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { cpf: { contains: search } },
        { phone: { contains: search } },
        { whatsappNumber: { contains: search } },
        { name: { contains: search } },
        { payments: { some: { macAddress: { contains: search } } } },
      ];
    }

    if (onlyBlocked) {
      // Tem carência usada E não tem pagamento aprovado
      where.OR = [
        { trialGrantedAt: { not: null } },
        { trialBlocked: true },
      ];
    }

    const leads = await prisma.hotspotLead.findMany({
      where,
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const mapped = leads.map((lead: any) => {
      const hasApproved = lead.payments.some((p: any) => p.status === 'approved');
      const hasPending = lead.payments.some((p: any) => p.status === 'pending');
      const trialUsed = Boolean(lead.trialGrantedAt) || Boolean(lead.trialBlocked);
      const mac = lead.payments.find((p: any) => p.macAddress)?.macAddress || null;

      return {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        cpf: lead.cpf,
        mac,
        createdAt: lead.createdAt,
        trialGrantedAt: lead.trialGrantedAt,
        trialBlocked: lead.trialBlocked,
        trialUsed,
        hasApproved,
        hasPending,
        // Status resumido
        status: hasApproved ? 'approved' : (trialUsed && !hasApproved ? 'trial_expired' : 'pending'),
        payments: lead.payments.map((p: any) => ({
          id: p.id,
          pixId: p.pixId,
          amount: p.amount,
          status: p.status,
          macAddress: p.macAddress,
          createdAt: p.createdAt,
        })),
      };
    });

    return NextResponse.json({ success: true, data: mapped, total: mapped.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Erro ao listar leads' }, { status: 500 });
  }
}

/**
 * DELETE /api/portal/admin/leads?id=LEAD_ID
 * Libera o cliente: reseta carência, deleta pagamentos pendentes,
 * remove da blacklist e do ip-binding do MikroTik.
 */
export async function DELETE(request: Request) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, message: 'Parâmetro "id" é obrigatório.' }, { status: 400 });
  }

  try {
    const lead = await prisma.hotspotLead.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!lead) {
      return NextResponse.json({ success: false, message: 'Cliente não encontrado.' }, { status: 404 });
    }

    // 1. Reseta carência no banco
    await prisma.hotspotLead.update({
      where: { id },
      data: {
        trialGrantedAt: null,
        trialBlocked: false,
      },
    });

    // 2. Cancela/deleta pagamentos pendentes deste lead
    const pendingPayments = lead.payments.filter((p: any) => p.status === 'pending');
    if (pendingPayments.length > 0) {
      await prisma.payment.deleteMany({
        where: {
          leadId: id,
          status: 'pending',
        },
      });
    }

    // 3. Descobre o MAC associado ao lead (pelo Payment ou buscando na Blacklist)
    const paymentMac = lead.payments.find((p: any) => p.macAddress)?.macAddress;

    // 4. Remove da blacklist (por MAC, CPF e telefone)
    const orClauses: any[] = [];
    if (paymentMac) orClauses.push({ mac: paymentMac });
    if (lead.cpf) orClauses.push({ cpf: lead.cpf });
    if (lead.phone) orClauses.push({ phone: lead.phone });

    let blacklistRemoved = 0;
    let targetMac = paymentMac || null;

    if (orClauses.length > 0) {
      const blockedRecords = await prisma.blockedClient.findMany({
        where: { OR: orClauses },
      });
      for (const rec of blockedRecords) {
        if (!targetMac && rec.mac) {
          targetMac = rec.mac;
        }
        await prisma.blockedClient.delete({ where: { id: rec.id } });
        blacklistRemoved++;
      }
    }

    // 5. Remove ip-binding bloqueado no MikroTik (se tiver MAC)
    let mkUnblocked = false;
    if (targetMac) {
      try {
        const activeRouter = await prisma.router.findFirst({ where: { active: true } });
        if (activeRouter) {
          const mk = new MikrotikAPI();
          if (await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port)) {
            mkUnblocked = await mk.unblockHotspotMac(targetMac);
            mk.disconnect();
          }
        }
      } catch (mkErr) {
        console.warn('[Admin Leads] Erro ao desbloquear MikroTik:', mkErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cliente ${lead.name || lead.phone} liberado com sucesso. Pode se recadastrar normalmente.`,
      data: {
        leadId: id,
        mac: targetMac,
        pendingPaymentsDeleted: pendingPayments.length,
        blacklistRemoved,
        mkUnblocked,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Erro ao liberar cliente' }, { status: 500 });
  }
}
