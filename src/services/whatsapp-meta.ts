import { prisma } from '@/lib/prisma';
import type { IWhatsappAdapter, SendMessageOptions, SendMessageResult } from './whatsapp-interface';

/**
 * Adapter para a Meta Cloud API oficial.
 * Gerencia múltiplas instâncias (phone IDs) com roteamento inteligente,
 * preservação estrita de dados quando desativado e limite diário por instância.
 */
export class MetaAdapter implements IWhatsappAdapter {
  private qrCode: string | null = null;

  /** Encontra qual instância (phone) usar para um dado número de cliente */
  private async routeCustomerMessage(
    customerPhone: string,
    pinnedInstanceId?: string
  ): Promise<{ token: string; phoneId: string; instanceId: string } | null> {
    let cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Session Pinning direto
    if (pinnedInstanceId) {
      const pinned = await prisma.whatsappInstance.findFirst({
        where: { id: pinnedInstanceId, engine: 'meta', active: true, status: 'connected' }
      });
      if (pinned && pinned.token && pinned.phoneId) {
        return { token: pinned.token, phoneId: pinned.phoneId, instanceId: pinned.id };
      }
      console.warn(`[Meta] Instância fixada ${pinnedInstanceId} não encontrada ou inativa.`);
    }

    // 2. Verifica roteamento ativo existente
    const routing = await prisma.leadRouting.findUnique({
      where: { customerPhone: cleanPhone },
      include: { whatsappInstance: true }
    });

    if (routing?.whatsappInstance?.status === 'connected' && routing.whatsappInstance.active && routing.whatsappInstance.engine === 'meta') {
      await prisma.leadRouting.update({
        where: { id: routing.id },
        data: { lastInteraction: new Date() }
      });
      return {
        token: routing.whatsappInstance.token!,
        phoneId: routing.whatsappInstance.phoneId!,
        instanceId: routing.whatsappInstance.id
      };
    }

    // 3. Busca instâncias ativas disponíveis da Meta
    const activeInstances = await prisma.whatsappInstance.findMany({
      where: {
        engine: 'meta',
        active: true,
        status: 'connected',
        token: { not: null },
        phoneId: { not: null }
      }
    });

    if (activeInstances.length === 0) {
      console.error('[Meta] Nenhuma instância WhatsApp Meta ativa disponível.');
      return null;
    }

    // 4. Seleciona instância com menor volume do dia (< 250)
    let selectedInstance = activeInstances[0];
    for (const instance of activeInstances) {
      const daily = await prisma.dailyConversation.upsert({
        where: { whatsappInstanceId_date: { whatsappInstanceId: instance.id, date: today } },
        update: {},
        create: { whatsappInstanceId: instance.id, date: today, count: 0 }
      });
      if (daily.count < 250) {
        selectedInstance = instance;
        break;
      }
    }

    // Salva ou atualiza roteamento
    await prisma.leadRouting.upsert({
      where: { customerPhone: cleanPhone },
      update: { whatsappInstanceId: selectedInstance.id, lastInteraction: new Date() },
      create: { customerPhone: cleanPhone, whatsappInstanceId: selectedInstance.id }
    });

    // Incrementa contador diário
    await prisma.dailyConversation.update({
      where: { whatsappInstanceId_date: { whatsappInstanceId: selectedInstance.id, date: today } },
      data: { count: { increment: 1 } }
    });

    await prisma.whatsappInstance.update({
      where: { id: selectedInstance.id },
      data: { dailyCount: { increment: 1 }, lastSeen: new Date() }
    }).catch(() => {});

    return { token: selectedInstance.token!, phoneId: selectedInstance.phoneId!, instanceId: selectedInstance.id };
  }

  /** Normaliza o número para o formato aceito pela Meta (apenas dígitos com DDI) */
  private normalize(to: string): string {
    let digits = to.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
    return digits;
  }

  async sendMessage(to: string, text: string, options?: SendMessageOptions): Promise<SendMessageResult> {
    try {
      const config = await this.routeCustomerMessage(to, options?.pinnedInstanceId);
      if (!config) return { success: false, error: 'Nenhuma instância da Meta disponível' };

      const cleanTo = this.normalize(to);
      const res = await fetch(`https://graph.facebook.com/v19.0/${config.phoneId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: { preview_url: false, body: text }
        })
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(`[Meta] Falha ao enviar para ${cleanTo}:`, JSON.stringify(err));
        return { success: false, instanceId: config.instanceId, error: err?.error?.message || 'Erro Meta API' };
      }

      console.log(`[Meta][${config.instanceId}] Mensagem enviada para ${cleanTo}`);
      return { success: true, instanceId: config.instanceId };
    } catch (err: any) {
      console.error('[Meta] Erro ao enviar mensagem:', err?.message || err);
      return { success: false, error: err?.message || 'Erro de conexão' };
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    components: any[] = [],
    options?: SendMessageOptions
  ): Promise<SendMessageResult> {
    try {
      const config = await this.routeCustomerMessage(to, options?.pinnedInstanceId);
      if (!config) return { success: false, error: 'Nenhuma instância da Meta disponível' };

      const cleanTo = this.normalize(to);
      const body: any = {
        messaging_product: 'whatsapp',
        to: cleanTo,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(components.length > 0 ? { components } : {})
        }
      };

      const res = await fetch(`https://graph.facebook.com/v19.0/${config.phoneId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(`[Meta] Falha ao enviar template '${templateName}' para ${cleanTo}:`, JSON.stringify(err));
        return { success: false, instanceId: config.instanceId, error: err?.error?.message || 'Erro Meta Template' };
      }

      console.log(`[Meta][${config.instanceId}] Template '${templateName}' enviado para ${cleanTo}`);
      return { success: true, instanceId: config.instanceId };
    } catch (err: any) {
      console.error('[Meta] Erro ao enviar template:', err?.message || err);
      return { success: false, error: err?.message || 'Erro de conexão' };
    }
  }

  /** Retorna os números da Meta ativos */
  async getOnlineNumbers(): Promise<string[]> {
    try {
      const instances = await prisma.whatsappInstance.findMany({
        where: { engine: 'meta', active: true, status: 'connected', number: { not: null } },
        select: { number: true }
      });
      return instances.map(i => i.number!).filter(Boolean);
    } catch {
      return [];
    }
  }

  getQrCode(): string | null {
    return null; // API oficial não usa QR code
  }

  getStatus(): string {
    return 'connected';
  }

  logout(): void {
    // Sem logout de credenciais
  }

  async getProfilePictureUrl(_to: string): Promise<string | null> {
    return null;
  }
}

