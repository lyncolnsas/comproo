import { prisma } from '@/lib/prisma';
import { getMikrotikClient } from '@/lib/session';
import { whatsappService } from '@/services/whatsapp';
import { spinText } from '@/utils/spintax';

export class WaitingListService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isChecking = false;

  public startAutoCheck(intervalMs = 30 * 1000) {
    if (this.syncInterval) return;
    this.syncInterval = setInterval(() => {
      this.checkWaitingList().catch((err) => {
        console.error('[WaitingList] Check error:', err);
      });
    }, intervalMs);
  }

  public async checkWaitingList(): Promise<void> {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      // 1. Get first pending user in queue
      const nextUser = await prisma.waitingList.findFirst({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' }
      });

      if (!nextUser) {
        return; // No one in queue
      }

      // 2. Check if we have capacity
      const configMaxUsers = await prisma.systemConfig.findUnique({ where: { key: 'MAX_HOTSPOT_USERS' } });
      const maxUsersLimit = parseInt(configMaxUsers?.value || '0', 10);

      if (maxUsersLimit === 0) return; // No limit configured

      let currentUsers = 0;
      let mk;
      try {
        mk = await getMikrotikClient();
        const activeUsers = await mk.getHotspotActive();
        currentUsers = activeUsers.length;
        mk.disconnect();
      } catch (err) {
        console.error('[WaitingList] Error getting active users from Mikrotik', err);
        return;
      }

      // 3. If there is space, notify the user and mark as notified
      if (currentUsers < maxUsersLimit) {
        // Send WhatsApp using Template to bypass the 24-hour service window limit
        const networkName = process.env.HOTSPOT_NETWORK_NAME || 'nossa rede Wi-Fi';
        
        try {
          // sendWhatsAppTemplate funciona nos dois modos:
          // - Meta: envia o template aprovado com components (usa a janela fora das 24h)
          // - Baileys: converte o template em mensagem de texto livre (sem custo)
          await whatsappService.sendWhatsAppTemplate(
            'admin',
            nextUser.whatsapp,
            'liberacao_wifi',
            'pt_BR',
            [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: 'Cliente' },       // {{cliente}}
                  { type: 'text', text: networkName }      // {{nome_produto}}
                ]
              }
            ]
          );
        } catch (waErr) {
          console.error(`[WaitingList] Error sending WA notification to ${nextUser.whatsapp}`, waErr);
        }

        // Update status to notified
        await prisma.waitingList.update({
          where: { id: nextUser.id },
          data: { 
            status: 'notified',
            notifiedAt: new Date()
          }
        });

        console.log(`[WaitingList] Notified user ${nextUser.whatsapp} (Current Active: ${currentUsers}/${maxUsersLimit})`);
      }
    } catch (e) {
      console.error('[WaitingList] Critical error:', e);
    } finally {
      this.isChecking = false;
    }
  }
}

const globalForWaitingList = globalThis as unknown as {
  waitingListService: WaitingListService | undefined;
};

export const waitingListService: WaitingListService =
  globalForWaitingList.waitingListService || new WaitingListService();

if (process.env.NODE_ENV !== 'production') {
  globalForWaitingList.waitingListService = waitingListService;
}
