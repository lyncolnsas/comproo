import fs from 'fs';
import path from 'path';
import os from 'os';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';
import { networkSyncService } from './network-sync';
import { waitingListService } from './waiting-list-sync';
import { MercadoPagoService } from './mercadopago';
import { spinText } from '@/utils/spintax';
import { MetaAdapter } from './whatsapp-meta';
import { BaileysAdapter } from './whatsapp-baileys';
import type { IWhatsappAdapter } from './whatsapp-interface';
import { getMaskedPortalDomain, getMaskedPortalUrl } from '@/lib/domain';

interface ChatState {
  step: number;
  mac?: string;
  name?: string;
  password?: string;
  selectedPlanId?: string;
  token?: string;
  tokenVerified?: boolean;
}

class WhatsappSpecialist {
  private chatStates: Map<string, ChatState> = new Map();
  private stateFilePath = path.join(process.cwd(), 'whatsapp_states.json');
  private cronStarted = false;

  // Adapters — gerenciados pelo facade
  private metaAdapter: MetaAdapter = new MetaAdapter();
  private baileysAdapter: BaileysAdapter | null = null;

  constructor() {
    this.loadStates();
    if (!this.cronStarted) {
      this.cronStarted = true;
      setInterval(() => this.cleanupExpiredBindings(), 60000);
      networkSyncService.startAutoSync();
      waitingListService.startAutoCheck();
      this.initActiveMode();
    }
  }

  // ─── Inicialização e Gestão de Adapters ────────────────────────────────────

  /** Obtém ou cria o adapter do Baileys com listener de mensagens ativado */
  public getBaileysAdapter(): BaileysAdapter {
    if (!this.baileysAdapter) {
      this.baileysAdapter = new BaileysAdapter(async (instanceId, remoteJid, text, messageKey) => {
        // Simula leitura de mensagem antes de responder
        if (messageKey && this.baileysAdapter) {
          const session = this.baileysAdapter.getSession(instanceId);
          if (session) {
            this.baileysAdapter.simulateReading(session, remoteJid, messageKey).catch(() => {});
          }
        }
        await this.handleIncomingMessage(instanceId, remoteJid, text);
      });

      this.baileysAdapter.setOnConnected((instanceId) => {
        console.log(`[WhatsApp] Baileys conectado com sucesso na instância ${instanceId}! Disparando sincronização de fotos...`);
        setTimeout(() => {
          this.syncPendingAvatars().catch((err) => {
            console.warn('[WhatsApp] Erro na sincronização automática de fotos:', err);
          });
        }, 3000);
      });
    }
    return this.baileysAdapter;
  }

  /** Inicializa os motores corretos no arranque do servidor */
  private async initActiveMode() {
    try {
      const [metaCfg, baileysCfg, legacyMode] = await Promise.all([
        prisma.systemConfig.findUnique({ where: { key: 'WHATSAPP_META_ENABLED' } }),
        prisma.systemConfig.findUnique({ where: { key: 'WHATSAPP_BAILEYS_ENABLED' } }),
        prisma.systemConfig.findUnique({ where: { key: 'WHATSAPP_MODE' } }),
      ]);

      let isMeta = metaCfg?.value === 'true';
      let isBaileys = baileysCfg ? baileysCfg.value === 'true' : true;

      // Migração suave de WHATSAPP_MODE legada
      if (!metaCfg && !baileysCfg && legacyMode?.value) {
        if (legacyMode.value === 'meta') {
          isMeta = true;
          isBaileys = false;
        } else {
          isMeta = false;
          isBaileys = true;
        }
        await Promise.all([
          prisma.systemConfig.upsert({ where: { key: 'WHATSAPP_META_ENABLED' }, update: { value: String(isMeta) }, create: { key: 'WHATSAPP_META_ENABLED', value: String(isMeta) } }),
          prisma.systemConfig.upsert({ where: { key: 'WHATSAPP_BAILEYS_ENABLED' }, update: { value: String(isBaileys) }, create: { key: 'WHATSAPP_BAILEYS_ENABLED', value: String(isBaileys) } }),
        ]);
      }

      console.log(`[WhatsApp Hub] Motores ativos no arranque: Meta Cloud API = ${isMeta ? 'ATIVO' : 'SUSPENSO'}, Baileys Multi-Device = ${isBaileys ? 'ATIVO' : 'DESLIGADO'}`);

      if (isBaileys) {
        this.getBaileysAdapter();
      }
    } catch (err) {
      console.error('[WhatsApp] Erro ao verificar motores no arranque:', err);
    }
  }

  public async isMetaEnabled(): Promise<boolean> {
    const cfg = await prisma.systemConfig.findUnique({ where: { key: 'WHATSAPP_META_ENABLED' } });
    return cfg?.value === 'true';
  }

  public async isBaileysEnabled(): Promise<boolean> {
    const cfg = await prisma.systemConfig.findUnique({ where: { key: 'WHATSAPP_BAILEYS_ENABLED' } });
    return cfg ? cfg.value === 'true' : true;
  }

  public async getOperationalMode(): Promise<'meta' | 'baileys' | 'hybrid' | 'none'> {
    const [meta, baileys] = await Promise.all([this.isMetaEnabled(), this.isBaileysEnabled()]);
    if (meta && baileys) return 'hybrid';
    if (meta) return 'meta';
    if (baileys) return 'baileys';
    return 'none';
  }

  /**
   * Liga ou desliga um motor de forma independente.
   * Ao desligar a Meta: NUNCA apaga dados. Apenas marca active: false e status: suspended.
   * Ao desligar o Baileys: Executa graceful shutdown completo no socket antes de fechar.
   */
  public async setEngineState(engine: 'meta' | 'baileys', enabled: boolean): Promise<void> {
    if (engine === 'meta') {
      await prisma.systemConfig.upsert({
        where: { key: 'WHATSAPP_META_ENABLED' },
        update: { value: String(enabled) },
        create: { key: 'WHATSAPP_META_ENABLED', value: String(enabled) }
      });

      // Atualiza status das instâncias da Meta sem deletar NENHUM dado confidencial
      await prisma.whatsappInstance.updateMany({
        where: { engine: 'meta' },
        data: { active: enabled, status: enabled ? 'connected' : 'suspended' }
      });
      console.log(`[WhatsApp Hub] Meta Cloud API agora está: ${enabled ? 'ATIVADA' : 'SUSPENSA (dados preservados)'}`);
    }

    if (engine === 'baileys') {
      await prisma.systemConfig.upsert({
        where: { key: 'WHATSAPP_BAILEYS_ENABLED' },
        update: { value: String(enabled) },
        create: { key: 'WHATSAPP_BAILEYS_ENABLED', value: String(enabled) }
      });

      if (!enabled && this.baileysAdapter) {
        console.log('[WhatsApp Hub] Desligando Baileys com Graceful Shutdown...');
        await this.baileysAdapter.shutdownAll();
      } else if (enabled) {
        console.log('[WhatsApp Hub] Ativando pool de instâncias Baileys...');
        this.getBaileysAdapter().initSessionsPool().catch(() => {});
      }
    }
  }

  /** Reinicia o Baileys ou uma instância específica */
  public async restartBaileys(instanceId?: string): Promise<void> {
    const adapter = this.getBaileysAdapter();
    await adapter.restart(instanceId);
  }

  /** Conecta uma nova instância Baileys e gera seu QR Code exclusivo */
  public async connectBaileysInstance(instanceId: string, name?: string): Promise<void> {
    const adapter = this.getBaileysAdapter();
    await adapter.connectInstance(instanceId, name);
  }

  /** Desconecta de forma graciosa o Baileys ou uma instância específica */
  public async logoutBaileys(instanceId?: string, deleteData = false): Promise<void> {
    if (this.baileysAdapter) {
      if (instanceId) {
        await this.baileysAdapter.gracefulShutdown(instanceId, deleteData);
      } else {
        await this.baileysAdapter.shutdownAll();
      }
    }
  }

  /** Retorna as configurações de mascaramento do Baileys */
  public async getBaileysMAskingConfig() {
    return this.getBaileysAdapter().getMaskingConfig();
  }

  /** Salva as configurações de mascaramento do Baileys */
  public async saveBaileysMAskingConfig(config: import('./whatsapp-baileys').MaskingConfig) {
    return this.getBaileysAdapter().saveMaskingConfig(config);
  }

  /** Retorna o modo atual e o status consolidado de ambos os motores */
  public async getModeInfo(): Promise<{
    mode: 'meta' | 'baileys' | 'hybrid' | 'none';
    metaEnabled: boolean;
    baileysEnabled: boolean;
    status: string;
    qrCode: string | null;
  }> {
    const [metaEnabled, baileysEnabled, mode] = await Promise.all([
      this.isMetaEnabled(),
      this.isBaileysEnabled(),
      this.getOperationalMode()
    ]);

    let status = 'disconnected';
    let qrCode: string | null = null;

    if (baileysEnabled && this.baileysAdapter) {
      status = this.baileysAdapter.getStatus();
      qrCode = this.baileysAdapter.getQrCode();
    } else if (metaEnabled) {
      status = 'connected';
    }

    return {
      mode,
      metaEnabled,
      baileysEnabled,
      status,
      qrCode
    };
  }

  /**
   * Lista formatada de todos os números de WhatsApp oficiais da rede que estão online.
   * Exemplo: ['+55 11 99999-0001', '+55 11 99999-0002']
   */
  public async getOnlineOfficialNumbers(): Promise<string[]> {
    const numbersSet = new Set<string>();

    const [isMeta, isBaileys] = await Promise.all([this.isMetaEnabled(), this.isBaileysEnabled()]);

    if (isBaileys && this.baileysAdapter) {
      const bNums = this.baileysAdapter.getOnlineNumbers();
      bNums.forEach(n => numbersSet.add(n));
    }

    if (isMeta) {
      const mNums = await this.metaAdapter.getOnlineNumbers();
      mNums.forEach(n => numbersSet.add(n));
    }

    const formatNumber = (num: string) => {
      const clean = num.replace(/\D/g, '');
      if (clean.length === 13 && clean.startsWith('55')) {
        return `+${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 9)}-${clean.slice(9)}`;
      }
      if (clean.length === 12 && clean.startsWith('55')) {
        return `+${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 8)}-${clean.slice(8)}`;
      }
      if (clean.length === 11) {
        return `+55 ${clean.slice(0, 2)} ${clean.slice(2, 7)}-${clean.slice(7)}`;
      }
      return clean.startsWith('+') ? clean : `+${clean}`;
    };

    return Array.from(numbersSet).map(formatNumber);
  }

  // ─── API Pública de Envio de Mensagens (com Session Pinning e Dual-Engine) ────

  public async sendWhatsAppMessage(
    userId: string = 'admin',
    toJid: string,
    content: string,
    options?: import('./whatsapp-interface').SendMessageOptions
  ): Promise<{ success: boolean; instanceId?: string; error?: string }> {
    const [metaEnabled, baileysEnabled] = await Promise.all([
      this.isMetaEnabled(),
      this.isBaileysEnabled()
    ]);

    // 1. Session Pinning estrito: Se foi fornecido pinnedInstanceId, descobre qual motor é
    if (options?.pinnedInstanceId) {
      const pinned = await prisma.whatsappInstance.findUnique({ where: { id: options.pinnedInstanceId } });
      if (pinned) {
        if (pinned.engine === 'baileys' && baileysEnabled) {
          const res = await this.getBaileysAdapter().sendMessage(toJid, content, options);
          return typeof res === 'boolean' ? { success: res, instanceId: pinned.id } : res;
        } else if (pinned.engine === 'meta' && metaEnabled) {
          const res = await this.metaAdapter.sendMessage(toJid, content, options);
          return typeof res === 'boolean' ? { success: res, instanceId: pinned.id } : res;
        }
      }
    }

    // 2. Se houver preferência de motor explícita
    if (options?.preferredEngine === 'meta' && metaEnabled) {
      const res = await this.metaAdapter.sendMessage(toJid, content, options);
      return typeof res === 'boolean' ? { success: res } : res;
    }

    if (options?.preferredEngine === 'baileys' && baileysEnabled) {
      const res = await this.getBaileysAdapter().sendMessage(toJid, content, options);
      return typeof res === 'boolean' ? { success: res } : res;
    }

    // 3. Modo Híbrido Concorrente ou Apenas Baileys: prioriza Baileys para vouchers e mensagens dinâmicas
    if (baileysEnabled) {
      const res = await this.getBaileysAdapter().sendMessage(toJid, content, options);
      const resultObj = typeof res === 'boolean' ? { success: res } : res;

      // Se falhou no Baileys e a Meta estiver ativa em modo híbrido, failover automático para a Meta
      if (!resultObj.success && metaEnabled) {
        console.warn(`[WhatsApp Hub] Falha no Baileys para ${toJid}. Realizando Failover para Meta Cloud API...`);
        const metaRes = await this.metaAdapter.sendMessage(toJid, content, options);
        return typeof metaRes === 'boolean' ? { success: metaRes } : metaRes;
      }
      return resultObj;
    }

    // 4. Apenas Meta ativa
    if (metaEnabled) {
      const res = await this.metaAdapter.sendMessage(toJid, content, options);
      return typeof res === 'boolean' ? { success: res } : res;
    }

    return { success: false, error: 'Nenhum motor de WhatsApp ativo nas configurações' };
  }

  public async sendWhatsAppTemplate(
    userId: string = 'admin',
    toJid: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    components: any[] = [],
    options?: import('./whatsapp-interface').SendMessageOptions
  ): Promise<{ success: boolean; instanceId?: string; error?: string }> {
    const [metaEnabled, baileysEnabled] = await Promise.all([
      this.isMetaEnabled(),
      this.isBaileysEnabled()
    ]);

    // Prioriza Meta para templates oficiais
    if (metaEnabled) {
      const res = await this.metaAdapter.sendTemplate(toJid, templateName, languageCode, components, options);
      return typeof res === 'boolean' ? { success: res } : res;
    }

    // Se Meta não estiver ativa, Baileys converte o template em texto formatado
    if (baileysEnabled) {
      const res = await this.getBaileysAdapter().sendTemplate(toJid, templateName, languageCode, components, options);
      return typeof res === 'boolean' ? { success: res } : res;
    }

    return { success: false, error: 'Nenhum provedor de WhatsApp ativo para envio de template' };
  }

  // ─── Sincronização e Download de Fotos de Perfil do WhatsApp ─────────────

  /**
   * Baixa a imagem de perfil do WhatsApp e salva localmente em /public/uploads/avatar_{leadId}.jpg
   * Atualiza o lead no banco de dados com a URL relativa do avatar.

   */
  public async downloadAndSaveContactAvatar(leadId: string, phone: string): Promise<string | null> {
    try {
      if (!leadId || !phone) return null;

      const digits = phone.replace(/\D/g, '');
      if (digits.length < 8) return null;

      const adapter = this.baileysAdapter || this.getBaileysAdapter();
      if (!adapter || typeof adapter.getProfilePictureUrl !== 'function') return null;

      const profilePicUrl = await adapter.getProfilePictureUrl(phone);
      if (!profilePicUrl) {
        console.log(`[AvatarSync] Nenhuma foto de perfil encontrada para ${phone}`);
        return null;
      }

      console.log(`[AvatarSync] Foto encontrada para ${phone}. Baixando da CDN do WhatsApp...`);

      const res = await fetch(profilePicUrl);
      if (!res.ok) {
        console.warn(`[AvatarSync] Falha ao baixar imagem da CDN (${res.status}): ${res.statusText}`);
        return null;
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `avatar_${leadId}.jpg`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const avatarUrl = `/uploads/${fileName}`;

      await (prisma.hotspotLead as any).update({
        where: { id: leadId },
        data: { avatarUrl }
      });

      console.log(`[AvatarSync] Foto de perfil salva com sucesso para lead ${leadId} (${phone}): ${avatarUrl}`);
      return avatarUrl;
    } catch (err: any) {
      console.warn(`[AvatarSync] Erro ao sincronizar avatar do lead ${leadId} (${phone}):`, err?.message || err);
      return null;
    }
  }

  /**
   * Sincroniza fotos pendentes de todos os leads que possuem telefone mas não possuem avatar salvo
   */
  public async syncPendingAvatars(): Promise<number> {
    try {
      const pendingLeads = await (prisma.hotspotLead as any).findMany({
        where: {
          avatarUrl: null,
          OR: [
            { phone: { not: null } },
            { whatsappNumber: { not: null } }
          ]
        },
        take: 30,
        orderBy: { createdAt: 'desc' }
      });

      if (!pendingLeads || pendingLeads.length === 0) return 0;

      console.log(`[AvatarSync] Iniciando busca de foto para ${pendingLeads.length} leads pendentes...`);
      let successCount = 0;

      for (const lead of pendingLeads) {
        const phone = lead.whatsappNumber || lead.phone;
        if (phone) {
          const res = await this.downloadAndSaveContactAvatar(lead.id, phone);
          if (res) successCount++;
          // Intervalo de 600ms entre requisições para evitar rate limit
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      console.log(`[AvatarSync] Sincronização concluída: ${successCount} fotos obtidas de ${pendingLeads.length} leads.`);
      return successCount;
    } catch (err: any) {
      console.error('[AvatarSync] Erro ao sincronizar avatares pendentes:', err);
      return 0;
    }
  }

  // ─── Utilitários de Rede e Sistema ───────────────────────────────────────

  public async autoSyncNetworkIp() {
    return networkSyncService.syncNetworkIp();
  }

  private loadStates() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const data = fs.readFileSync(this.stateFilePath, 'utf-8');
        this.chatStates = new Map(Object.entries(JSON.parse(data)));
      }
    } catch (e) {
      console.error('Failed to load chat states:', e);
    }
  }

  private saveStates() {
    try {
      fs.writeFileSync(this.stateFilePath, JSON.stringify(Object.fromEntries(this.chatStates)), 'utf-8');
    } catch (e) {
      console.error('Failed to save chat states:', e);
    }
  }

  private async cleanupExpiredBindings() {
    try {
      const activeRouter = await prisma.router.findFirst({ where: { active: true } });
      if (!activeRouter) return;

      const mk = new MikrotikAPI();
      const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
      if (!connected) return;

      const bindings = await mk.getHotspotIpBindings() as any[];
      const now = Date.now();

      for (const b of bindings) {
        if (b.type === 'bypassed' && b.comment?.startsWith('temp-whatsapp-')) {
          const timestamp = parseInt(b.comment.split('-')[2]);
          if (!isNaN(timestamp) && now - timestamp > 15 * 60 * 1000) {
            await mk.removeHotspotIpBinding(b['.id'] || b['id']);
            console.log(`Removed expired binding for MAC: ${b['mac-address']}`);
          }
        }
      }
      await mk.close();
    } catch (e) {
      // silent
    }
  }

  private async getServerIp(): Promise<string> {
    try {
      const router = await prisma.router.findFirst({ where: { active: true } });
      if (!router?.host) return 'portal.wifi.local';
      const interfaces = os.networkInterfaces();
      const routerPrefix = router.host.split('.').slice(0, 3).join('.');
      let currentIp = 'portal.wifi.local';
      outer: for (const ifaces of Object.values(interfaces)) {
        for (const iface of ifaces || []) {
          if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith(routerPrefix + '.')) {
            currentIp = iface.address;
            break outer;
          }
        }
      }
      if (currentIp === 'portal.wifi.local') {
        outer2: for (const ifaces of Object.values(interfaces)) {
          for (const iface of ifaces || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
              currentIp = iface.address;
              break outer2;
            }
          }
        }
      }
      return currentIp;
    } catch {
      return 'portal.wifi.local';
    }
  }

  // ─── Fluxo Interativo de Cadastro e Vendas (Meta e Baileys) ───────────────

  public async startRegistrationFlow(userId: string, remoteJid: string, mac: string) {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    this.chatStates.set(remoteJid, { step: 0, mac, token, tokenVerified: false });
    this.saveStates();

    const portalUrl = getMaskedPortalUrl();
    await this.sendWhatsAppMessage(userId, remoteJid, spinText(
      `{👋|🙌|✨|😃|🤖} {Olá|Oi|Opa|Seja bem-vindo|E aí}! Bem-vindo à nossa Wi-Fi.\n\n{Para liberar|Para acessar} seu acesso, {acesse|visite} {nossa página|nosso portal} de {cadastro|registro}:\n${portalUrl}/portal/register`
    ));
  }

  public async verifyToken(remoteJid: string, token: string): Promise<boolean> {
    return true;
  }

  public async continueRegistrationFlow(userId: string, remoteJid: string) {
    const state = this.chatStates.get(remoteJid) || { step: 0 };
    state.step = 1;
    this.chatStates.set(remoteJid, state);
    this.saveStates();

    await this.sendWhatsAppMessage(userId, remoteJid, spinText(
      `{✅|🚀|👍|✨} {Número confirmado|Tudo certo|Validação concluída} com sucesso!\n\n{Para começar|Para iniciar} a {configuração|criação} da sua {conta|conexão}, {digite|informe} o *NOME* que deseja {usar|cadastrar}:`
    ));
  }

  public async handleIncomingMessage(phoneId: string, remoteJid: string, text: string) {
    // Roteamento inteligente na Meta (ignorado se for Baileys)
    if (phoneId !== 'baileys') {
      let cleanPhone = remoteJid.replace(/\D/g, '');
      if (cleanPhone.length === 10 || cleanPhone.length === 11) cleanPhone = `55${cleanPhone}`;
      const instance = await prisma.whatsappInstance.findFirst({ where: { phoneId } });
      if (instance) {
        await prisma.leadRouting.upsert({
          where: { customerPhone: cleanPhone },
          update: { whatsappInstanceId: instance.id, lastInteraction: new Date() },
          create: { customerPhone: cleanPhone, whatsappInstanceId: instance.id }
        });
      }
    }

    const state = this.chatStates.get(remoteJid) || { step: 0 };
    const content = text.trim();

    // ── Passo Inicial (Cliente chamou no WhatsApp sem cadastro prévio) ──
    if (!state.step || state.step === 0) {
      const portalUrl = getMaskedPortalUrl();
      await this.sendWhatsAppMessage('admin', remoteJid, spinText(
        `{👋|🙌|✨|😃|🤖} {Olá|Oi|Opa|Seja bem-vindo}! Bem-vindo ao atendimento automático da nossa Wi-Fi.\n\n` +
        `{Para liberar seu acesso à internet|Para acessar o portal de conexão}, visite:\n` +
        `${portalUrl}/portal/register\n\n` +
        `Ou se deseja comprar um plano de acesso por aqui agora mesmo, responda informando seu *NOME*:`
      ));
      state.step = 1;
      this.chatStates.set(remoteJid, state);
      this.saveStates();
      return;
    }

    // ── Passo 1: Nome informado ──
    if (state.step === 1) {
      state.name = content;
      state.step = 2;
      this.chatStates.set(remoteJid, state);
      this.saveStates();
      await this.sendWhatsAppMessage('admin', remoteJid, spinText(
        `{Prazer|Muito prazer}, ${state.name}! {🤝|✨|😃}\n\n{Agora|Para continuar}, {crie|escolha|informe} uma *Chave de Acesso* (senha) que você quer {usar|cadastrar} para {acessar|conectar n}a {internet|rede|Wi-Fi} no futuro:`
      ));
      return;
    }

    // ── Passo 2: Chave de Acesso informada -> Exibe Lista de Planos ──
    if (state.step === 2) {
      state.password = content;

      const plans = await prisma.whatsappPlan.findMany({ where: { active: true }, orderBy: { price: 'asc' } });

      if (plans.length === 0) {
        await this.sendWhatsAppMessage('admin', remoteJid, spinText(
          `{❌|⚠️} No momento não temos {planos|pacotes} {disponíveis|ativos}. {Contate|Fale com} o {suporte|atendimento}.`
        ));
        this.chatStates.delete(remoteJid);
        this.saveStates();
        return;
      }

      state.step = 3;
      this.chatStates.set(remoteJid, state);
      this.saveStates();

      let plansText = spinText(`{Ótimo|Perfeito|Legal}! {Escolha|Selecione} o {plano|pacote} {digitando|respondendo com} o *NÚMERO*:\n\n`);
      plans.forEach((p, i) => {
        plansText += `*${i + 1}* - ${p.title} (R$ ${p.price.toFixed(2)})\n`;
      });

      await this.sendWhatsAppMessage('admin', remoteJid, plansText);
      return;
    }

    // ── Passo 3: Escolha do Plano e Geração do Pagamento PIX ──
    if (state.step === 3) {
      const choice = parseInt(content);
      const plans = await prisma.whatsappPlan.findMany({ where: { active: true }, orderBy: { price: 'asc' } });

      if (isNaN(choice) || choice < 1 || choice > plans.length) {
        await this.sendWhatsAppMessage('admin', remoteJid, spinText(
          `{⚠️|❌} {Opção inválida|Número incorreto}. {Digite|Envie} {apenas|somente} o *número* de uma das {opções acima|opções disponíveis}.`
        ));
        return;
      }

      const selectedPlan = plans[choice - 1];

      await this.sendWhatsAppMessage('admin', remoteJid, spinText(
        `{⏳|🔄|⚙️} {Gerando|Preparando} seu PIX no valor de *R$ ${selectedPlan.price.toFixed(2)}*, {aguarde|espere um instante}...`
      ));

      try {
        const mpConfig = await prisma.systemConfig.findUnique({ where: { key: 'MERCADOPAGO_TOKEN' } });
        const manualPixConfig = await prisma.systemConfig.findUnique({ where: { key: 'MANUAL_PIX_KEY' } });

        const lead = await prisma.hotspotLead.upsert({
          where: { hotspotUser: state.name || '' },
          update: { password: state.password, whatsappNumber: remoteJid },
          create: {
            name: state.name || '',
            hotspotUser: state.name || '',
            password: state.password || '',
            whatsappNumber: remoteJid
          }
        });

        // ── Opção A: PIX Manual (Chave PIX) ──
        if (!mpConfig?.value) {
          const pixKey = manualPixConfig?.value || 'Não configurada';

          const activeRouter = await prisma.router.findFirst({ where: { active: true } });
          if (activeRouter) {
            const mk = new MikrotikAPI();
            const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
            if (connected) {
              if (state.mac) {
                try {
                  const trialUser = `T-${state.mac}`;
                  await mk.removeHotspotActiveByUser(trialUser);
                  await mk.removeHotspotUserByName(trialUser);
                  const bindings = await mk.getHotspotIpBindings() as any[];
                  for (const b of bindings) {
                    if (b['mac-address'] === state.mac && b.type === 'bypassed') {
                      await mk.removeHotspotIpBinding(b['.id'] || b.id);
                    }
                  }
                } catch (e) {}
              }
              try {
                await mk.addHotspotUser({
                  name: state.name?.replace(/\s+/g, '').toLowerCase() || '',
                  password: state.password || '',
                  profile: selectedPlan.profile,
                  comment: `Venda Manual WhatsApp`,
                  server: 'all'
                });
              } catch (e) {}
              mk.disconnect();
            }
          }

          await prisma.payment.create({
            data: {
              leadId: lead.id,
              status: 'pending',
              amount: selectedPlan.price,
              profile: selectedPlan.profile,
              macAddress: state.mac
            }
          });

          // Mensagem pós-cadastro com dados de acesso (formato camuflado US/SN)
          await this.sendWhatsAppMessage('admin', remoteJid,
            `Olá ${state.name}! A sua solicitação foi registrada com sucesso.\n\nDetalhes de Acesso:\n\nUS: *${state.name}*\nSN: *${state.password}*\n\nGuarde essas informações para conectar seus aparelhos.\n\n⚠️ Para ativar seu plano, efetue o pagamento de *R$ ${selectedPlan.price.toFixed(2)}*:\n\n*CHAVE PIX:* ${pixKey}`
          );

          this.chatStates.delete(remoteJid);
          this.saveStates();
          return;
        }

        // ── Opção B: Mercado Pago (PIX Automático Copia e Cola) ──
        const mpService = new MercadoPagoService(mpConfig.value);
        const paymentRes = await mpService.createPixPayment({
          transaction_amount: selectedPlan.price,
          description: `Voucher Wi-Fi: ${selectedPlan.title}`,
          payer: {
            email: `${state.name?.replace(/\s+/g, '').toLowerCase() || 'cliente'}@wifi.local`,
            first_name: state.name || 'Cliente'
          }
        });

        const pixId = String(paymentRes.id);
        const pixPayload = paymentRes.point_of_interaction?.transaction_data?.qr_code;
        const qrCode64 = paymentRes.point_of_interaction?.transaction_data?.qr_code_base64;

        if (!pixPayload) throw new Error('Falha ao gerar o código PIX.');

        await prisma.payment.create({
          data: {
            leadId: lead.id,
            pixId,
            pixPayload,
            pixQrCodeBase64: qrCode64,
            amount: selectedPlan.price,
            profile: selectedPlan.profile,
            macAddress: state.mac
          }
        });

        // Mensagem pós-compra de voucher com Pix Copia e Cola
        await this.sendWhatsAppMessage('admin', remoteJid, spinText(
          `{✅|🚀|💸} *PIX Gerado com Sucesso!*\n\n{Copie|Pegue} o {código|Pix Copia e Cola} abaixo e {pague|realize o pagamento} no {aplicativo do seu banco|seu app bancário}.\n\n*Sua conexão está liberada temporariamente para você abrir o app do banco.*\n\nAssim que o pagamento for confirmado, seu voucher será ativado automaticamente!`
        ));
        await this.sendWhatsAppMessage('admin', remoteJid, pixPayload);

        this.chatStates.delete(remoteJid);
        this.saveStates();
      } catch (err: any) {
        console.error('Error generating PIX:', err);
        await this.sendWhatsAppMessage('admin', remoteJid, spinText(
          `{❌|⚠️} {Ocorreu um erro|Tivemos um problema} ao gerar seu PIX: ${err?.message || 'Erro desconhecido'}. {Contate o suporte|Fale com o administrador}.`
        ));
      }
      return;
    }
  }

  // ─── Status e Compatibilidade ─────────────────────────────────────────────

  getQrCode(instanceId?: string): string | null {
    return this.baileysAdapter?.getQrCode(instanceId) || null;
  }

  getStatus(instanceId?: string): string {
    if (this.baileysAdapter) {
      return this.baileysAdapter.getStatus(instanceId);
    }
    return 'disconnected';
  }

  logout(instanceId?: string) {
    this.logoutBaileys(instanceId);
  }

  async fetchInstanceGroups(instanceId: string) {
    const adapter = this.getBaileysAdapter();
    return await adapter.fetchInstanceGroups(instanceId);
  }

  setInstanceLibraryGroup(instanceId: string, groupJid: string | null, groupName: string | null) {
    const adapter = this.getBaileysAdapter();
    adapter.setInstanceLibraryGroup(instanceId, groupJid, groupName);
  }

  async syncAllInstancesToGroup(groupJid: string, groupName: string) {
    const adapter = this.getBaileysAdapter();
    await adapter.syncAllInstancesToGroup(groupJid, groupName);
  }

  async ensureInstanceInLibraryGroup(instanceId: string) {
    const adapter = this.getBaileysAdapter();
    const session = adapter.getAllSessions().find(s => s.id === instanceId);
    if (session) {
      await adapter.ensureInstanceInLibraryGroup(session);
    }
  }
}

// ─── Singleton global (compatível com Next.js hot reload) ───────────────────

const globalForWhatsApp = global as unknown as {
  whatsappSpecialist?: WhatsappSpecialist;
  whatsappBootstrapped?: boolean;
};

export const whatsappService: WhatsappSpecialist =
  globalForWhatsApp.whatsappSpecialist || new WhatsappSpecialist();
globalForWhatsApp.whatsappSpecialist = whatsappService;

if (!globalForWhatsApp.whatsappBootstrapped) {
  globalForWhatsApp.whatsappBootstrapped = true;
}
