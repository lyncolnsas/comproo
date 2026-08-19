import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';
import { whatsappService } from '@/services/whatsapp';

export async function POST(request: Request) {
  try {
    const { paymentId, action } = await request.json();

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { lead: true }
    });

    if (!payment) return NextResponse.json({ success: false, error: 'Pagamento não encontrado.' }, { status: 404 });

    const activeRouter = await prisma.router.findFirst({ where: { active: true } });
    if (!activeRouter) return NextResponse.json({ success: false, error: 'Sem roteador ativo.' }, { status: 500 });

    const mk = new MikrotikAPI();
    const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
    if (!connected) return NextResponse.json({ success: false, error: 'Falha na conexão com roteador.' }, { status: 500 });

    const hotspotUser = payment.lead.hotspotUser;

    if (action === 'approve') {
      // Atualiza banco
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'approved' }
      });

      // Ativa no MikroTik caso estivesse desativado
      const users = await mk.getHotspotUsers() as any[];
      const found = users.find(u => u['name'] === hotspotUser);
      if (found) {
        const id = found['.id'] || found['id'];
        await mk.enableHotspotUser(id);
      }

      // Manda mensagem de agradecimento
      if (payment.lead.whatsappNumber) {
        whatsappService.sendWhatsAppMessage('admin', payment.lead.whatsappNumber, 
          `🎉 *Pagamento Confirmado!*\n\nMuito obrigado! O seu acesso já está validado e liberado permanentemente no sistema.`
        );
      }

    } else if (action === 'block') {
      // Bloqueia no MikroTik
      const users = await mk.getHotspotUsers() as any[];
      const found = users.find(u => u['name'] === hotspotUser);
      if (found) {
        const id = found['.id'] || found['id'];
        await mk.disableHotspotUser(id);
        
        // Remove active session
        try {
          const actives = await mk.getActiveHotspotUsers() as any[];
          const activeSess = actives.find(a => a.user === hotspotUser);
          if (activeSess) {
             const activeId = activeSess['.id'] || activeSess['id'];
             await mk.removeActiveHotspotUser(activeId);
          }
        } catch(e) {}
      }

      // Manda mensagem de cobrança
      if (payment.lead.whatsappNumber) {
        const configPix = await prisma.systemConfig.findUnique({ where: { key: 'MANUAL_PIX_KEY' } });
        const pixKey = configPix?.value || '';

        whatsappService.sendWhatsAppMessage('admin', payment.lead.whatsappNumber, 
          `⚠️ *Aviso de Bloqueio*\n\nNotamos que o pagamento do seu voucher não foi confirmado e o seu acesso foi suspenso.\n\nPor favor, faça o PIX de *R$ ${payment.amount.toFixed(2)}* para a chave: *${pixKey}* e envie o comprovante para reativarmos.`
        );
      }
    }

    mk.disconnect();
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
