import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';
import type { IWhatsappAdapter, SendMessageOptions, SendMessageResult } from './whatsapp-interface';
import { usePrismaAuthState } from './baileys-prisma-auth';

// ─── Template text converters (Meta → Baileys free text) ─────────────────────

const TEMPLATE_TEXTS: Record<string, (...vars: string[]) => string> = {
  liberacao_wifi: (cliente: string, nomeProduto: string) =>
    `Olá ${cliente}! 🎉 Temos uma ótima notícia:\n\nA sua vaga no plano *${nomeProduto}* foi liberada!\n\nA sua conexão já está pronta para uso no seu dispositivo.\n\nPara gerenciar o seu serviço ou tirar dúvidas, basta responder a esta mensagem.`,
  lembrete_pagamento: (cliente: string, valor: string) =>
    `Olá ${cliente}, tudo bem? Notamos uma pendência na renovação do seu acesso Wi-Fi.\n\nPara evitar interrupções, lembre-se de concluir o pagamento de *R$ ${valor}*.\n\nCaso já tenha pago, por favor desconsidere esta mensagem.`,
  numero_de_serie_: (cliente: string, us: string, sn: string) =>
    `Olá ${cliente}! A sua configuração foi concluída com sucesso.\n\nDetalhes de acesso:\n\nUS: *${us}*\nSN: *${sn}*\n\nGuarde essas informações para conectar seus aparelhos. Se precisar de suporte, basta responder aqui.`,
};

function extractParamsFromComponents(components: any[]): string[] {
  const params: string[] = [];
  for (const comp of components || []) {
    if (comp?.parameters) {
      for (const p of comp.parameters) {
        if (p?.text !== undefined) params.push(String(p.text));
      }
    }
  }
  return params;
}

// ─── Masking config (loaded from DB, cached globally) ─────────────────────────

export interface MaskingConfig {
  enabled: boolean;
  browserFingerprint: boolean;
  simulateTyping: boolean;
  simulateReading: boolean;
  simulateReceipt: boolean;
  typingDelayBetweenChunks: boolean;
  standbyEnabled: boolean;
  standbyMinSeconds: number;
  standbyMaxSeconds: number;
  typingCancelSimulation: boolean;
}

const DEFAULT_MASKING: MaskingConfig = {
  enabled: false,
  browserFingerprint: true,
  simulateTyping: true,
  simulateReading: true,
  simulateReceipt: true,
  typingDelayBetweenChunks: true,
  standbyEnabled: false,
  standbyMinSeconds: 30,
  standbyMaxSeconds: 180,
  typingCancelSimulation: true,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Calculate realistic typing duration based on text length at ~55 WPM */
function typingDuration(text: string): number {
  const avgWordLen = 5;
  const wpm = randomBetween(50, 70);
  const words = text.length / avgWordLen;
  const ms = (words / wpm) * 60 * 1000;
  return Math.min(Math.max(ms, 800), 6000); // clamp 0.8s–6s
}

/** Split message into natural human chunks (by sentence or length) */
function splitIntoChunks(text: string): string[] {
  if (text.length <= 120) return [text];
  const sentences = text.split(/(?<=[.!?…])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > 150 && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += (current ? ' ' : '') + s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

// ─── Message handler type ────────────────────────────────────────────────────

export type MessageHandler = (instanceId: string, remoteJid: string, text: string, messageKey?: any) => Promise<void>;

// ─── Session Instance Representation ─────────────────────────────────────────

export interface BaileysSessionInstance {
  id: string;
  name: string;
  number: string | null;
  sock: any;
  qrCode: string | null;
  status: 'disconnected' | 'waiting_qr' | 'reconnecting' | 'connected' | 'error';
  sessionDir: string;
  isConnecting: boolean;
  lastSeen: Date | null;
  reconnectTimeout?: NodeJS.Timeout;
}

// ─── BaileysAdapter (Multi-Instance Manager) ──────────────────────────────────

export class BaileysAdapter implements IWhatsappAdapter {
  private sessions: Map<string, BaileysSessionInstance> = new Map();
  private roundRobinIndex: number = 0;
  private onMessageReceived?: MessageHandler;
  private onConnected?: (instanceId: string) => void;
  private maskingConfig: MaskingConfig = { ...DEFAULT_MASKING };
  private maskingConfigLoaded = false;
  private baseDir = path.join(process.cwd(), 'baileys_sessions');

  constructor(onMessageReceived?: MessageHandler) {
    this.onMessageReceived = onMessageReceived;
    this.initSessionsPool().catch(err => {
      console.error('[BaileysManager] Erro ao inicializar pool de sessões:', err);
    });
  }

  public setMessageHandler(handler: MessageHandler) {
    this.onMessageReceived = handler;
  }

  public setOnConnected(handler: (instanceId: string) => void) {
    this.onConnected = handler;
  }

  // ─── Pool Initialization ────────────────────────────────────────────────────

  /**
   * Inicializa todas as instâncias cadastradas no banco como Baileys e ativas.
   * Se nenhuma existir, migra a sessão legada ou cria a instância padrão.
   */
  public async initSessionsPool(): Promise<void> {
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }

      // Migração suave: se existir pasta antiga baileys_session com credenciais e sem instâncias no banco
      const legacyDir = path.join(process.cwd(), 'baileys_session');
      let instances = await prisma.whatsappInstance.findMany({
        where: { engine: 'baileys', active: true }
      });

      if (instances.length === 0) {
        // Cria instância padrão no banco
        const defaultInstance = await prisma.whatsappInstance.create({
          data: {
            name: 'WhatsApp Principal 1',
            engine: 'baileys',
            status: 'disconnected',
            active: true
          }
        });
        instances = [defaultInstance];

        // Se houver sessão legada preexistente, copia para a nova pasta isolada
        const targetDir = path.join(this.baseDir, `instance_${defaultInstance.id}`);
        if (fs.existsSync(legacyDir) && fs.existsSync(path.join(legacyDir, 'creds.json')) && !fs.existsSync(targetDir)) {
          try {
            fs.mkdirSync(targetDir, { recursive: true });
            fs.cpSync(legacyDir, targetDir, { recursive: true });
            console.log(`[BaileysManager] Sessão legada migrada com sucesso para ${targetDir}`);
          } catch (mErr) {
            console.warn('[BaileysManager] Falha ao migrar sessão legada:', mErr);
          }
        }
      }

      // Inicia conexões em paralelo para todas as instâncias ativas
      for (const inst of instances) {
        await this.connectInstance(inst.id, inst.name);
      }
    } catch (err) {
      console.error('[BaileysManager] Erro no carregamento do pool:', err);
    }
  }

  // ─── Single Instance Connection ─────────────────────────────────────────────

  public async connectInstance(instanceId: string, customName?: string): Promise<BaileysSessionInstance> {
    let session = this.sessions.get(instanceId);
    const sessionDir = path.join(this.baseDir, `instance_${instanceId}`);

    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    if (!session) {
      session = {
        id: instanceId,
        name: customName || `WhatsApp ${instanceId.slice(0, 6)}`,
        number: null,
        sock: null,
        qrCode: null,
        status: 'disconnected',
        sessionDir,
        isConnecting: false,
        lastSeen: null
      };
      this.sessions.set(instanceId, session);
    }

    if (session.isConnecting) return session;
    session.isConnecting = true;

    try {
      const Baileys = await import('@whiskeysockets/baileys');
      const makeWASocket = Baileys.makeWASocket || Baileys.default;
      const { DisconnectReason, fetchLatestBaileysVersion } = Baileys;
      const pinoModule = await import('pino');
      const pino = (pinoModule as any).default || pinoModule;

      // Persistência no SQLite (Prisma) com migração automática dos JSONs legados de sessionDir ou legacyDir
      const legacyDir = path.join(process.cwd(), 'baileys_session');
      const fallbackDir = fs.existsSync(sessionDir) ? sessionDir : legacyDir;
      const { state, saveCreds } = await usePrismaAuthState(instanceId, fallbackDir);
      let version: [number, number, number] = [2, 3000, 1015901307];
      try {
        const v = await fetchLatestBaileysVersion();
        if (v?.version) version = v.version;
      } catch {
        // Fallback offline
      }

      // Anti-Ban: Realistic Chrome User-Agent
      const browserAgent: [string, string, string] = ['Chrome', 'Chrome', '125.0.6422.112'];

      session.sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: browserAgent,
        logger: pino({ level: 'silent' }),
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
      });

      session.sock.ev.on('creds.update', saveCreds);

      session.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          session!.qrCode = qr;
          session!.status = 'waiting_qr';
          console.log(`[Baileys][${session!.id}] QR Code gerado para pareamento.`);
          await prisma.whatsappInstance.update({
            where: { id: session!.id },
            data: { status: 'waiting_qr', qrCode: qr }
          }).catch(() => {});
        }

        if (connection === 'open') {
          session!.status = 'connected';
          session!.qrCode = null;
          session!.isConnecting = false;
          session!.lastSeen = new Date();

          const rawNumber = session!.sock?.user?.id?.split(':')[0]?.split('@')[0] || null;
          session!.number = rawNumber;

          console.log(`[Baileys][${session!.id}] Conectado e autenticado! Número: ${rawNumber || 'identificando...'}`);

          await prisma.whatsappInstance.update({
            where: { id: session!.id },
            data: {
              status: 'connected',
              qrCode: null,
              number: rawNumber || undefined,
              lastSeen: new Date()
            }
          }).catch(() => {});

          if (this.onConnected) {
            try {
              this.onConnected(session!.id);
            } catch (err) {
              console.error(`[Baileys][${session!.id}] Erro no callback onConnected:`, err);
            }
          }
        }

        if (connection === 'close') {
          session!.isConnecting = false;
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          session!.status = shouldReconnect ? 'reconnecting' : 'disconnected';
          console.log(`[Baileys][${session!.id}] Conexão encerrada (código: ${statusCode}). Reconectar: ${shouldReconnect}`);

          await prisma.whatsappInstance.update({
            where: { id: session!.id },
            data: {
              status: session!.status,
              qrCode: null
            }
          }).catch(() => {});

          if (shouldReconnect) {
            if (session!.reconnectTimeout) clearTimeout(session!.reconnectTimeout);
            session!.reconnectTimeout = setTimeout(() => {
              this.connectInstance(session!.id).catch(() => {});
            }, 5000);
          } else {
            session!.qrCode = null;
          }
        }
      });

      // ── Incoming Messages Listener ──────────────────────────────────────────
      session.sock.ev.on('messages.upsert', async (chatUpdate: any) => {
        try {
          if (chatUpdate.type !== 'notify') return;
          for (const msg of chatUpdate.messages || []) {
            if (!msg.message || msg.key.fromMe) continue;
            const remoteJid = msg.key.remoteJid;
            if (!remoteJid || remoteJid.includes('@g.us')) continue;

            const text =
              msg.message.conversation ||
              msg.message.extendedTextMessage?.text ||
              msg.message.buttonsResponseMessage?.selectedButtonId ||
              msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
              '';

            const trimmed = text.trim();
            if (trimmed && this.onMessageReceived) {
              console.log(`[Baileys][${session!.id}] Mensagem de ${remoteJid}: "${trimmed.slice(0, 30)}"`);
              await this.onMessageReceived(session!.id, remoteJid, trimmed, msg.key);
            }
          }
        } catch (err) {
          console.error(`[Baileys][${session!.id}] Erro ao processar mensagem:`, err);
        }
      });

    } catch (err: any) {
      session.status = 'error';
      session.isConnecting = false;
      console.error(`[Baileys][${session.id}] Erro na inicialização:`, err?.message || err);
      await prisma.whatsappInstance.update({
        where: { id: session.id },
        data: { status: 'error' }
      }).catch(() => {});
    }

    return session;
  }

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────

  /**
   * Encerramento gracioso obrigatório:
   * 1. Finaliza WebSocket via sock.end() / sock.logout()
   * 2. Remove todos os listeners
   * 3. Aguarda confirmação antes de alterar status ou apagar sessão
   */
  public async gracefulShutdown(instanceId: string, deleteData = false): Promise<void> {
    const session = this.sessions.get(instanceId);
    if (!session) return;

    console.log(`[Baileys][${instanceId}] Iniciando Graceful Shutdown (deleteData: ${deleteData})...`);
    if (session.reconnectTimeout) {
      clearTimeout(session.reconnectTimeout);
      session.reconnectTimeout = undefined;
    }

    session.status = 'disconnected';
    session.qrCode = null;
    session.isConnecting = false;

    if (session.sock) {
      try {
        if (deleteData) {
          await session.sock.logout().catch(() => {});
        }
        session.sock.end(new Error('Graceful shutdown solicitado'));
      } catch (e) {
        // Ignora erros ao fechar socket
      }
      try {
        session.sock.ev?.removeAllListeners();
      } catch {}
      session.sock = null;
    }

    await sleep(500); // Aguarda liberação de handle do SO

    if (deleteData) {
      // Remove do banco de dados SQLite
      await prisma.baileysAuth.deleteMany({
        where: { instanceId }
      }).catch(() => {});

      if (fs.existsSync(session.sessionDir)) {
        try {
          fs.rmSync(session.sessionDir, { recursive: true, force: true });
        } catch {}
      }
      console.log(`[Baileys][${instanceId}] Dados de autenticação removidos com sucesso.`);
    }

    await prisma.whatsappInstance.update({
      where: { id: instanceId },
      data: { status: 'disconnected', qrCode: null }
    }).catch(() => {});

    if (deleteData) {
      this.sessions.delete(instanceId);
    }
  }

  /** Desconecta todas as instâncias ativas no desligamento da aplicação */
  public async shutdownAll(): Promise<void> {
    for (const id of this.sessions.keys()) {
      await this.gracefulShutdown(id, false);
    }
  }

  // ─── Selection & Round-Robin ────────────────────────────────────────────────

  private isSocketReady(session?: BaileysSessionInstance): boolean {
    if (!session || !session.sock) return false;
    return session.status === 'connected' && Boolean(session.sock.user);
  }

  /**
   * Obtém a sessão correta considerando Session Pinning ou Round-Robin
   */
  public getSession(pinnedInstanceId?: string): BaileysSessionInstance | null {
    // 1. Se houver Session Pinning estrito
    if (pinnedInstanceId) {
      const pinned = this.sessions.get(pinnedInstanceId);
      if (pinned && this.isSocketReady(pinned)) {
        return pinned;
      }
      console.warn(`[BaileysManager] Instância fixada ${pinnedInstanceId} não está pronta. Buscando alternativa...`);
    }

    // 2. Coleta todas as instâncias conectadas e prontas
    const readySessions = Array.from(this.sessions.values()).filter(s => this.isSocketReady(s));
    if (readySessions.length === 0) {
      return null;
    }

    // 3. Balanceamento Round-Robin
    const selected = readySessions[this.roundRobinIndex % readySessions.length];
    this.roundRobinIndex = (this.roundRobinIndex + 1) % readySessions.length;
    return selected;
  }

  /** Lista todos os números de telefone online conectados */
  public getOnlineNumbers(): string[] {
    const list: string[] = [];
    for (const s of this.sessions.values()) {
      if (this.isSocketReady(s) && s.number) {
        list.push(s.number);
      }
    }
    return list;
  }

  /** Lista todas as sessões registradas em memória */
  public getAllSessions(): BaileysSessionInstance[] {
    return Array.from(this.sessions.values());
  }

  // ─── Masking Simulation ─────────────────────────────────────────────────────

  private async loadMaskingConfig(): Promise<MaskingConfig> {
    try {
      const rows = await prisma.systemConfig.findMany({
        where: { key: { startsWith: 'BAILEYS_MASK_' } }
      });
      const map: Record<string, string> = {};
      for (const r of rows) map[r.key] = r.value;

      this.maskingConfig = {
        enabled: map['BAILEYS_MASK_ENABLED'] === 'true',
        browserFingerprint: map['BAILEYS_MASK_BROWSER'] !== 'false',
        simulateTyping: map['BAILEYS_MASK_TYPING'] !== 'false',
        simulateReading: map['BAILEYS_MASK_READING'] !== 'false',
        simulateReceipt: map['BAILEYS_MASK_RECEIPT'] !== 'false',
        typingDelayBetweenChunks: map['BAILEYS_MASK_CHUNKS'] !== 'false',
        standbyEnabled: map['BAILEYS_MASK_STANDBY'] === 'true',
        standbyMinSeconds: parseInt(map['BAILEYS_MASK_STANDBY_MIN'] || '30'),
        standbyMaxSeconds: parseInt(map['BAILEYS_MASK_STANDBY_MAX'] || '180'),
        typingCancelSimulation: map['BAILEYS_MASK_TYPING_CANCEL'] !== 'false',
      };
      this.maskingConfigLoaded = true;
    } catch {}
    return this.maskingConfig;
  }

  public async saveMaskingConfig(config: Partial<MaskingConfig>): Promise<void> {
    const entries: Array<{ key: string; value: string }> = [];
    if (config.enabled !== undefined) entries.push({ key: 'BAILEYS_MASK_ENABLED', value: String(config.enabled) });
    if (config.browserFingerprint !== undefined) entries.push({ key: 'BAILEYS_MASK_BROWSER', value: String(config.browserFingerprint) });
    if (config.simulateTyping !== undefined) entries.push({ key: 'BAILEYS_MASK_TYPING', value: String(config.simulateTyping) });
    if (config.simulateReading !== undefined) entries.push({ key: 'BAILEYS_MASK_READING', value: String(config.simulateReading) });
    if (config.simulateReceipt !== undefined) entries.push({ key: 'BAILEYS_MASK_RECEIPT', value: String(config.simulateReceipt) });
    if (config.typingDelayBetweenChunks !== undefined) entries.push({ key: 'BAILEYS_MASK_CHUNKS', value: String(config.typingDelayBetweenChunks) });
    if (config.standbyEnabled !== undefined) entries.push({ key: 'BAILEYS_MASK_STANDBY', value: String(config.standbyEnabled) });
    if (config.standbyMinSeconds !== undefined) entries.push({ key: 'BAILEYS_MASK_STANDBY_MIN', value: String(config.standbyMinSeconds) });
    if (config.standbyMaxSeconds !== undefined) entries.push({ key: 'BAILEYS_MASK_STANDBY_MAX', value: String(config.standbyMaxSeconds) });
    if (config.typingCancelSimulation !== undefined) entries.push({ key: 'BAILEYS_MASK_TYPING_CANCEL', value: String(config.typingCancelSimulation) });

    await Promise.all(entries.map(({ key, value }) =>
      prisma.systemConfig.upsert({ where: { key }, update: { value }, create: { key, value } })
    ));
    this.maskingConfigLoaded = false;
  }

  public async getMaskingConfig(): Promise<MaskingConfig> {
    return this.loadMaskingConfig();
  }

  public async simulateReading(session: BaileysSessionInstance, remoteJid: string, messageKey: any): Promise<void> {
    const cfg = await this.loadMaskingConfig();
    if (!cfg.enabled || !cfg.simulateReading || !this.isSocketReady(session)) return;

    try {
      if (cfg.simulateReceipt) {
        await sleep(randomBetween(500, 2000));
      }
      await sleep(randomBetween(2000, 8000));
      await session.sock.readMessages([messageKey]);
    } catch {}
  }

  private async simulateTypingPresence(session: BaileysSessionInstance, jid: string, text: string, cfg: MaskingConfig): Promise<void> {
    if (!this.isSocketReady(session)) return;
    try {
      const duration = typingDuration(text);
      if (cfg.typingCancelSimulation) {
        await session.sock.sendPresenceUpdate('composing', jid);
        await sleep(randomBetween(600, 1500));
        await session.sock.sendPresenceUpdate('paused', jid);
        await sleep(randomBetween(400, 900));
        await session.sock.sendPresenceUpdate('composing', jid);
        await sleep(duration);
      } else {
        await session.sock.sendPresenceUpdate('composing', jid);
        await sleep(duration);
      }
      await session.sock.sendPresenceUpdate('paused', jid);
    } catch {}
  }

  // ─── JID Resolution (9º dígito Brasil) ──────────────────────────────────────

  private async resolveJid(session: BaileysSessionInstance, to: string): Promise<string> {
    let digits = to.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
    digits = digits.replace(/@.+/, '');
    const defaultJid = `${digits}@s.whatsapp.net`;

    if (!session.sock) return defaultJid;
    const cleanJid = (j: string) => j.replace(/:\d+@/, '@');

    try {
      const check1 = await session.sock.onWhatsApp(digits);
      if (check1 && check1.length > 0 && check1[0]?.exists && check1[0]?.jid) {
        return cleanJid(check1[0].jid);
      }

      if (digits.startsWith('55') && digits.length === 13) {
        const ddd = digits.slice(2, 4);
        const without9 = `55${ddd}${digits.slice(5)}`;
        const checkWithout9 = await session.sock.onWhatsApp(without9);
        if (checkWithout9 && checkWithout9.length > 0 && checkWithout9[0]?.exists && checkWithout9[0]?.jid) {
          return cleanJid(checkWithout9[0].jid);
        }
      }

      if (digits.startsWith('55') && digits.length === 12) {
        const ddd = digits.slice(2, 4);
        const with9 = `55${ddd}9${digits.slice(4)}`;
        const checkWith9 = await session.sock.onWhatsApp(with9);
        if (checkWith9 && checkWith9.length > 0 && checkWith9[0]?.exists && checkWith9[0]?.jid) {
          return cleanJid(checkWith9[0].jid);
        }
      }
    } catch {}

    return defaultJid;
  }

  // ─── Public Send Implementation ─────────────────────────────────────────────

  async sendMessage(to: string, text: string, options?: SendMessageOptions): Promise<SendMessageResult> {
    const session = this.getSession(options?.pinnedInstanceId);
    if (!session || !this.isSocketReady(session)) {
      console.error(`[BaileysManager] Nenhum socket pronto para envio para ${to}. Fixado: ${options?.pinnedInstanceId || 'nenhum'}`);
      return { success: false, error: 'Aparelho Baileys offline ou desconectado' };
    }

    const cfg = await this.loadMaskingConfig();
    const jid = await this.resolveJid(session, to);

    try {
      const sendMediaIfPresent = async () => {
        if (options?.media?.url && options?.media?.type) {
          try {
            // For audio, we might want ptt: true (voice note), but default is fine.
            const msgPayload: any = { [options.media.type]: { url: options.media.url } };
            if (options.media.type === 'audio') {
              msgPayload.mimetype = 'audio/mp4'; // recommended by Baileys for generic audio
            }
            await session.sock.sendMessage(jid, msgPayload);
            await sleep(1500); // pause to let the media process
          } catch (mediaErr) {
            console.error(`[Baileys][${session.id}] Erro ao enviar mídia para ${jid}:`, mediaErr);
          }
        }
      };

      // Immediate transactional send (credentials / vouchers / PIX)
      if (options?.skipStandby || !cfg.enabled) {
        if (cfg.enabled && cfg.simulateTyping) {
          try {
            await session.sock.sendPresenceUpdate('composing', jid);
            await sleep(randomBetween(800, 1500));
            await session.sock.sendPresenceUpdate('paused', jid);
          } catch {}
        }
        await sendMediaIfPresent();
        await session.sock.sendMessage(jid, { text });
        console.log(`[Baileys][${session.id}] Mensagem enviada com sucesso para ${jid}`);
        this.incrementDailyCount(session.id);
        return { success: true, instanceId: session.id };
      }

      // Standby delay simulation
      if (cfg.standbyEnabled) {
        const delayMs = randomBetween(cfg.standbyMinSeconds * 1000, cfg.standbyMaxSeconds * 1000);
        await sleep(delayMs);
      }

      await sendMediaIfPresent();

      const chunks = cfg.typingDelayBetweenChunks ? splitIntoChunks(text) : [text];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (cfg.simulateTyping) {
          await this.simulateTypingPresence(session, jid, chunk, cfg);
        }
        await session.sock.sendMessage(jid, { text: chunk });
        if (i < chunks.length - 1) {
          await sleep(randomBetween(1200, 3500));
        }
      }

      this.incrementDailyCount(session.id);
      return { success: true, instanceId: session.id };
    } catch (err: any) {
      console.error(`[Baileys][${session.id}] Erro ao enviar mensagem para ${jid}:`, err?.message || err);
      return { success: false, instanceId: session.id, error: err?.message || 'Falha no envio' };
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    _languageCode: string,
    components: any[],
    options?: SendMessageOptions
  ): Promise<SendMessageResult> {
    const params = extractParamsFromComponents(components);
    const builder = TEMPLATE_TEXTS[templateName];
    const text = builder ? builder(...params) : (params.length > 0 ? params.join('\n') : `Notificação: ${templateName}`);
    return this.sendMessage(to, text, options);
  }

  private incrementDailyCount(instanceId: string) {
    prisma.whatsappInstance.update({
      where: { id: instanceId },
      data: { dailyCount: { increment: 1 } }
    }).catch(() => {});
  }

  // ─── Status & QR Accessors ──────────────────────────────────────────────────

  getQrCode(instanceId?: string): string | null {
    if (instanceId) {
      return this.sessions.get(instanceId)?.qrCode || null;
    }
    // Retorna o primeiro que tiver QR esperando
    for (const s of this.sessions.values()) {
      if (s.qrCode) return s.qrCode;
    }
    return null;
  }

  getStatus(instanceId?: string): string {
    if (instanceId) {
      const s = this.sessions.get(instanceId);
      if (s?.sock?.user && s.status === 'reconnecting') return 'connected';
      return s?.status || 'disconnected';
    }
    // Se alguma estiver conectada, o provedor Baileys está ativo
    const anyConnected = Array.from(this.sessions.values()).some(s => this.isSocketReady(s));
    if (anyConnected) return 'connected';
    const anyQr = Array.from(this.sessions.values()).some(s => s.status === 'waiting_qr');
    if (anyQr) return 'waiting_qr';
    return 'disconnected';
  }

  async logout(instanceId?: string): Promise<void> {
    if (instanceId) {
      await this.gracefulShutdown(instanceId, true);
      return;
    }
    // Se não especificado, desconecta a primeira ou todas
    for (const id of this.sessions.keys()) {
      await this.gracefulShutdown(id, true);
    }
  }

  async restart(instanceId?: string): Promise<void> {
    if (instanceId) {
      await this.gracefulShutdown(instanceId, false);
      await this.connectInstance(instanceId);
      return;
    }
    for (const id of this.sessions.keys()) {
      await this.gracefulShutdown(id, false);
      await this.connectInstance(id);
    }
  }

  async getProfilePictureUrl(to: string, instanceId?: string): Promise<string | null> {
    const session = instanceId ? this.sessions.get(instanceId) : this.getSession();
    if (!session || !this.isSocketReady(session)) return null;

    try {
      const jid = await this.resolveJid(session, to);
      try {
        const url = await session.sock.profilePictureUrl(jid, 'image');
        if (url) return url;
      } catch {
        try {
          const previewUrl = await session.sock.profilePictureUrl(jid, 'preview');
          if (previewUrl) return previewUrl;
        } catch {}
      }
      return null;
    } catch {
      return null;
    }
  }
}
