import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';

export const dynamic = 'force-dynamic';

/**
 * Rotina de Varredura e Bloqueio Categórico de Inadimplentes (15 minutos).
 * Identifica cadastros que receberam a cortesia de 15 minutos para efetuar o pagamento PIX,
 * mas cujo pagamento não foi confirmado dentro da janela de carência.
 *
 * Ações executadas:
 * 1. Derruba a sessão ativa do usuário no MikroTik.
 * 2. Remove/desativa as credenciais de Hotspot no MikroTik.
 * 3. Registra o MAC address na tabela /ip/hotspot/ip-binding com type=blocked.
 * 4. Insere o cliente na tabela BlockedClient para impedir novas tentativas.
 * 5. Atualiza o status do pagamento para 'expired' e lead.trialBlocked = true.
 */
export async function GET(request: Request) {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Localiza pagamentos pendentes criados há mais de 15 minutos
    const expiredPayments = await prisma.payment.findMany({
      where: {
        status: 'pending',
        isVoucher: false,
        createdAt: { lte: fifteenMinutesAgo }
      },
      include: { lead: true }
    });

    if (expiredPayments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum pagamento pendente expirado no momento.',
        processedCount: 0
      });
    }

    let mk: MikrotikAPI | null = null;
    try {
      const activeRouter = await prisma.router.findFirst({ where: { active: true } });
      if (activeRouter) {
        mk = new MikrotikAPI();
        const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
        if (!connected) mk = null;
      }
    } catch (mkErr) {
      console.warn('[Check-Expirations] Falha ao conectar no MikroTik:', mkErr);
    }

    const results: any[] = [];

    for (const payment of expiredPayments) {
      const lead = payment.lead;
      const username = lead?.hotspotUser;
      const mac = payment.macAddress ? payment.macAddress.trim().toUpperCase() : null;
      let mkDisconnected = false;
      let mkBlocked = false;

      // 1. Operações no MikroTik
      if (mk) {
        try {
          if (username) {
            // Remove sessão ativa
            await mk.removeHotspotActiveByUser(username).catch(() => null);
            // Remove usuário do Hotspot
            await mk.removeHotspotUserByName(username).catch(() => null);
            mkDisconnected = true;
          }

          if (mac) {
            // Bloqueio categórico via IP-Binding type=blocked
            await mk.blockHotspotMac(mac, 'Expirado 15m sem pagamento PIX').catch(() => null);
            mkBlocked = true;
          }
        } catch (routerErr) {
          console.error(`[Check-Expirations] Erro ao bloquear ${username} no MikroTik:`, routerErr);
        }
      }

      // 2. Persistência de Bloqueio no Banco
      try {
        if (mac) {
          await prisma.blockedClient.upsert({
            where: { mac },
            update: {
              active: true,
              cpf: lead?.cpf || undefined,
              phone: lead?.phone || lead?.whatsappNumber || undefined,
              reason: 'Expirado 15m sem pagamento PIX'
            },
            create: {
              mac,
              cpf: lead?.cpf || null,
              phone: lead?.phone || lead?.whatsappNumber || null,
              reason: 'Expirado 15m sem pagamento PIX'
            }
          });
        }

        // Atualiza status no banco de dados
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'expired' }
        });

        if (lead?.id) {
          await prisma.hotspotLead.update({
            where: { id: lead.id },
            data: { trialBlocked: true }
          });
        }

        results.push({
          paymentId: payment.id,
          username,
          mac,
          cpf: lead?.cpf,
          mkDisconnected,
          mkBlocked,
          status: 'expired'
        });
      } catch (dbErr) {
        console.error(`[Check-Expirations] Erro ao atualizar banco para pagamento ${payment.id}:`, dbErr);
      }
    }

    // 3. Limpeza periódica de regras Temp WhatsApp de clientes que já estão ativos
    if (mk) {
      try {
        const activeSessions = (await mk.getHotspotActive()) as any[];
        for (const session of activeSessions) {
          const sMac = session['mac-address'] || session.macAddress;
          if (sMac) {
            await mk.removeTempWhatsAppAccess(sMac).catch(() => null);
          }
        }
      } catch (sweepErr) {
        console.warn('[Check-Expirations] Erro ao varrer regras Temp WhatsApp:', sweepErr);
      }
      mk.disconnect();
    }

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      results
    });

  } catch (error: any) {
    console.error('[Check-Expirations] Erro geral:', error);
    return NextResponse.json({
      success: false,
      message: error?.message || 'Erro interno ao verificar expirações.'
    }, { status: 500 });
  }
}
