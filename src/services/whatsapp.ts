import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';
import { MercadoPagoService } from './mercadopago';
import { Mutex } from 'async-mutex';

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
  private activeSockets: Map<string, ReturnType<typeof makeWASocket>> = new Map();
  private qrCodes: Map<string, string> = new Map(); 
  private connectionStatus: Map<string, string> = new Map(); 
  private chatStates: Map<string, ChatState> = new Map(); // remoteJid -> ChatState
  private mutex = new Mutex();
  private stateFilePath = path.join(process.cwd(), 'whatsapp_states.json');
  private cronStarted = false;

  constructor() {
    this.loadStates();
    if (!this.cronStarted) {
      this.cronStarted = true;
      setInterval(() => this.cleanupExpiredBindings(), 60000); // 1 minuto
      
      // Auto-start existing sessions
      setTimeout(() => this.autoConnectAll(), 5000);

      // Auto-sync IP
      setTimeout(() => this.autoSyncNetworkIp(), 15000);
      setInterval(() => this.autoSyncNetworkIp(), 5 * 60 * 1000); // 5 min
    }
  }

  private async autoConnectAll() {
    try {
        const instances = await prisma.whatsappInstance.findMany();
        for (const inst of instances) {
            const sessionDir = path.join(process.cwd(), 'baileys_auth_info', inst.id);
            if (fs.existsSync(sessionDir)) {
                console.log(`[WhatsApp] Auto-connecting instance: ${inst.id}`);
                this.connectWhatsApp(inst.id).catch(console.error);
                await new Promise(r => setTimeout(r, 2000)); // Delay between connections
            }
        }
    } catch(e) {
        console.error('[WhatsApp] Failed to auto-connect instances', e);
    }
  }

  private async autoSyncNetworkIp() {
    try {
      const router = await prisma.router.findFirst({ where: { active: true } });
      if (!router || !router.host) return;

      const interfaces = os.networkInterfaces();
      const routerPrefix = router.host.split('.').slice(0, 3).join('.');
      let currentIp = '127.0.0.1';

      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
          if (iface.family === 'IPv4' && !iface.internal) {
            if (iface.address.startsWith(routerPrefix + '.')) {
              currentIp = iface.address;
              break;
            }
          }
        }
        if (currentIp !== '127.0.0.1') break;
      }

      if (currentIp === '127.0.0.1') {
        for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name]!) {
            if (iface.family === 'IPv4' && !iface.internal) {
              currentIp = iface.address;
              break;
            }
          }
          if (currentIp !== '127.0.0.1') break;
        }
      }

      const api = new MikrotikAPI();
      const connected = await api.connect(router.host, router.user, router.password, router.port);
      if (!connected) return;

      try {
        const dnsMenu = (api as any).client.menu('/ip/dns/static');
        const list = await dnsMenu.get() as any[];
        const olds = list.filter((d: any) => d.name === 'portal.wifi.local');
        let needsUpdate = olds.length === 0;
        
        for (const old of olds) {
            if (old.address !== currentIp) {
                needsUpdate = true;
                await dnsMenu.remove(old.id || old['.id']);
            }
        }

        if (needsUpdate) {
            await dnsMenu.add({
              name: 'portal.wifi.local',
              address: currentIp,
              comment: 'MikroGestor: Magic Link DNS (Auto Sync)'
            });
            console.log(`[AutoSync] DNS portal.wifi.local updated to ${currentIp}`);
        }
      } catch(e) {}

      try {
        const wgIpMenu = (api as any).client.menu('/ip/hotspot/walled-garden/ip');
        const listIp = await wgIpMenu.get() as any[];
        
        const oldsIp = listIp.filter((d: any) => d.comment && d.comment.includes('MikroGestor: Auto-Cadastro / API IP'));
        let needsWgUpdate = oldsIp.length === 0;

        for (const old of oldsIp) {
            if (old['dst-address'] !== currentIp) {
                needsWgUpdate = true;
                await wgIpMenu.remove(old.id || old['.id']);
            }
        }

        if (needsWgUpdate) {
            await wgIpMenu.add({
              action: 'accept',
              'dst-address': currentIp,
              comment: 'MikroGestor: Auto-Cadastro / API IP'
            });
            console.log(`[AutoSync] Walled Garden IP updated to ${currentIp}`);
        }
      } catch(e) {}

      await api.close();

    } catch(e) {
      console.error('[AutoSync] Error syncing IP to Mikrotik', e);
    }
  }

  private loadStates() {
    try {
        if (fs.existsSync(this.stateFilePath)) {
            const data = fs.readFileSync(this.stateFilePath, 'utf-8');
            const parsed = JSON.parse(data);
            this.chatStates = new Map(Object.entries(parsed));
        }
    } catch(e) {
        console.error('Failed to load chat states:', e);
    }
  }

  private saveStates() {
    try {
        const obj = Object.fromEntries(this.chatStates);
        fs.writeFileSync(this.stateFilePath, JSON.stringify(obj), 'utf-8');
    } catch(e) {
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
        if (b.type === 'bypassed' && b.comment && b.comment.startsWith('temp-whatsapp-')) {
          const parts = b.comment.split('-');
          const timestamp = parseInt(parts[2]);
          if (!isNaN(timestamp)) {
            // Se passou de 15 minutos
            if (now - timestamp > 15 * 60 * 1000) {
              const id = b['.id'] || b['id'];
              await mk.removeHotspotIpBinding(id);
              console.log(`Removed expired binding for MAC: ${b['mac-address']}`);
            }
          }
        }
      }
      mk.disconnect();
    } catch (e) {
      // ignore
    }
  }
  
  async connectWhatsApp(userId: string = 'admin'): Promise<void> {
    try {
      const sessionDir = path.join(process.cwd(), 'baileys_auth_info', userId);
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    if (this.activeSockets.has(userId)) {
      try {
        this.activeSockets.get(userId)?.logout();
      } catch (e) {}
      this.activeSockets.delete(userId);
    }
    
    this.connectionStatus.set(userId, 'connecting');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'error' }) as any
    });
    
    this.activeSockets.set(userId, sock);
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        this.qrCodes.set(userId, qr);
      }
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        this.connectionStatus.set(userId, 'disconnected');
        
        if (shouldReconnect) {
          setTimeout(() => this.connectWhatsApp(userId), 5000);
        } else {
          fs.rmSync(sessionDir, { recursive: true, force: true });
          this.activeSockets.delete(userId);
          this.qrCodes.delete(userId);
        }
      } else if (connection === 'open') {
        this.connectionStatus.set(userId, 'connected');
        this.qrCodes.delete(userId);
        this.processQueue(userId);

        // Extrai número e foto de perfil e salva no banco
        if (sock.user) {
          const jid = sock.user.id;
          const number = jid.split(':')[0]; // get number part before :
          
          sock.profilePictureUrl(jid, 'image').then(picUrl => {
            prisma.whatsappInstance.update({
              where: { id: userId },
              data: { number, profilePicUrl: picUrl }
            }).catch(() => {});
          }).catch(() => {
            // Se der erro ao pegar a foto (ex: usuário sem foto), atualiza só o número
            prisma.whatsappInstance.update({
              where: { id: userId },
              data: { number }
            }).catch(() => {});
          });
        }

      }
    });

    sock.ev.on('messages.upsert', async (m) => {
      if (m.type !== 'notify') return;
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid) return;
      
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      if (!text) return;

      await this.handleIncomingMessage(userId, remoteJid, text);
    });
    } catch (err) {
      console.error(`Error in connectWhatsApp for user ${userId}:`, err);
      this.connectionStatus.set(userId, 'disconnected');
    }
  }

  private async getServerIp(): Promise<string> {
      try {
          const router = await prisma.router.findFirst({ where: { active: true } });
          if (!router || !router.host) return 'portal.wifi.local';
          const interfaces = os.networkInterfaces();
          const routerPrefix = router.host.split('.').slice(0, 3).join('.');
          let currentIp = 'portal.wifi.local';
          for (const name of Object.keys(interfaces)) {
              for (const iface of interfaces[name]!) {
                  if (iface.family === 'IPv4' && !iface.internal) {
                      if (iface.address.startsWith(routerPrefix + '.')) {
                          currentIp = iface.address;
                          break;
                      }
                  }
              }
              if (currentIp !== 'portal.wifi.local') break;
          }
          if (currentIp === 'portal.wifi.local') {
              for (const name of Object.keys(interfaces)) {
                  for (const iface of interfaces[name]!) {
                      if (iface.family === 'IPv4' && !iface.internal) {
                          currentIp = iface.address;
                          break;
                      }
                  }
                  if (currentIp !== 'portal.wifi.local') break;
              }
          }
          return currentIp;
      } catch(e) {
          return 'portal.wifi.local';
      }
  }

  public async startRegistrationFlow(userId: string, remoteJid: string, mac: string) {
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      this.chatStates.set(remoteJid, { step: 0, mac, token, tokenVerified: false });
      this.saveStates();
      
      const sock = this.activeSockets.get(userId);
      if (sock && sock.user) {
          const botNumber = sock.user.id.split(':')[0];
          const vcard = 'BEGIN:VCARD\n' 
            + 'VERSION:3.0\n' 
            + 'FN:Wi-Fi Autoatendimento\n' 
            + `TEL;type=CELL;type=VOICE;waid=${botNumber}:+${botNumber}\n`
            + 'END:VCARD';
          try {
            await sock.sendMessage(remoteJid, { contacts: { displayName: 'Wi-Fi Autoatendimento', contacts: [{ vcard }] } });
            await new Promise(r => setTimeout(r, 1000));
          } catch(e) {}
      }

      const phoneStr = remoteJid.split('@')[0];
      
      await this.sendWhatsAppMessage(userId, remoteJid, 
        `👋 Olá! Vimos que você quer se conectar na nossa rede Wi-Fi.\n\n⏳ Liberamos sua internet por *15 minutos* para você concluir seu cadastro.\n\n⚠️ *IMPORTANTE:* Salve este contato na sua agenda para conseguir clicar no link abaixo!\n\nConfirme seu número clicando neste link automático:\nhttp://portal.wifi.local/portal/verify?phone=${phoneStr}&token=${token}`
      );
  }

  public async verifyToken(remoteJid: string, token: string): Promise<boolean> {
      const state = this.chatStates.get(remoteJid);
      if (state && state.token === token) {
          state.tokenVerified = true;
          this.saveStates();
          return true;
      }
      return false;
  }

  public async continueRegistrationFlow(userId: string, remoteJid: string) {
      const state = this.chatStates.get(remoteJid);
      if (state) {
          state.step = 1;
          this.chatStates.set(remoteJid, state);
          this.saveStates();
      }
      await this.sendWhatsAppMessage(userId, remoteJid, 
        `✅ Número confirmado com sucesso!\n\nPara começar a configuração da sua conta, por favor, digite o *NOME* que você deseja usar:`
      );
  }

  private async handleIncomingMessage(userId: string, remoteJid: string, text: string) {
    const state = this.chatStates.get(remoteJid) || { step: 0 };
    const content = text.trim();

    if (state.step === 1) {
      state.name = content;
      state.step = 2;
      this.saveStates();
      await this.sendWhatsAppMessage(userId, remoteJid, 
        `Prazer em te conhecer, ${state.name}! \n\nAgora, digite uma *Senha* que você quer usar para acessar a internet no futuro:`
      );
      return;
    }

    if (state.step === 2) {
      state.password = content;
      
      // Buscar os planos ativos
      const plans = await prisma.whatsappPlan.findMany({
        where: { active: true },
        orderBy: { price: 'asc' }
      });

      if (plans.length === 0) {
        await this.sendWhatsAppMessage(userId, remoteJid, 
          `❌ No momento não temos planos disponíveis para venda por aqui. Contate o suporte.`
        );
        this.chatStates.delete(remoteJid);
        this.saveStates();
        return;
      }

      state.step = 3;
      this.chatStates.set(remoteJid, state);
      this.saveStates();
      
      let plansText = `Ótimo! Agora escolha o plano desejado digitando o *NÚMERO* correspondente:\n\n`;
      plans.forEach((p, index) => {
        plansText += `*${index + 1}* - ${p.title} (R$ ${p.price.toFixed(2)})\n`;
      });

      await this.sendWhatsAppMessage(userId, remoteJid, plansText);
      return;
    }

    if (state.step === 3) {
      const choice = parseInt(content);
      const plans = await prisma.whatsappPlan.findMany({
        where: { active: true },
        orderBy: { price: 'asc' }
      });

      if (isNaN(choice) || choice < 1 || choice > plans.length) {
        await this.sendWhatsAppMessage(userId, remoteJid, `⚠️ Opção inválida. Por favor, digite apenas o *número* de uma das opções acima.`);
        return;
      }

      const selectedPlan = plans[choice - 1];
      
      await this.sendWhatsAppMessage(userId, remoteJid, 
        `⏳ Gerando seu PIX no valor de *R$ ${selectedPlan.price.toFixed(2)}*, por favor aguarde...`
      );

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
                } catch(e) {}
              }

              try {
                await mk.addHotspotUser({
                  name: state.name?.replace(/\s+/g, '').toLowerCase() || '',
                  password: state.password || '',
                  profile: selectedPlan.profile,
                  comment: `Venda Manual WhatsApp`,
                  server: 'all'
                });
              } catch(e) {}
              mk.disconnect();
            }
          }

          // 2. Salvar Payment no banco como Pendente (sem pixId)
          await prisma.payment.create({
            data: {
              leadId: lead.id,
              status: 'pending',
              amount: selectedPlan.price,
              profile: selectedPlan.profile,
              macAddress: state.mac
            }
          });

          // 3. Avisar o cliente
          await this.sendWhatsAppMessage(userId, remoteJid, 
            `✅ *Sua internet foi liberada sob confiança!*\n\nUsuário: ${state.name}\nSenha: ${state.password}\n\n⚠️ Por favor, efetue o pagamento de *R$ ${selectedPlan.price.toFixed(2)}* para evitar o bloqueio da sua conta.\n\n*CHAVE PIX:* ${pixKey}`
          );

          this.chatStates.delete(remoteJid);
          return;
        }

        // ================= MODO AUTOMÁTICO (MERCADO PAGO) =================
        const mpService = new MercadoPagoService(mpConfig.value);
        
        const paymentRes = await mpService.createPixPayment({
          transaction_amount: selectedPlan.price,
          description: `Voucher Wi-Fi: ${selectedPlan.title}`,
          payer: {
            email: `${state.name?.replace(/\\s+/g, '').toLowerCase() || 'cliente'}@wifi.local`,
            first_name: state.name || 'Cliente'
          }
        });

        const pixId = String(paymentRes.id);
        const pixPayload = paymentRes.point_of_interaction?.transaction_data?.qr_code;
        const qrCode64 = paymentRes.point_of_interaction?.transaction_data?.qr_code_base64;

        if (!pixPayload) throw new Error("Falha ao gerar o código PIX.");

        // Salvar Payment no banco
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

        // Enviar o Copia e Cola
        await this.sendWhatsAppMessage(userId, remoteJid, 
          `✅ *PIX Gerado com Sucesso!*\n\nCopie o código abaixo e pague no aplicativo do seu banco. *A sua internet está liberada provisoriamente para você poder acessar o app do banco.*\n\nAssim que o pagamento for confirmado, você será liberado automaticamente!`
        );
        
        await this.sendWhatsAppMessage(userId, remoteJid, pixPayload);

        this.chatStates.delete(remoteJid); // Acaba o fluxo de conversação
      } catch (err: any) {
        console.error('Error generating PIX:', err);
        await this.sendWhatsAppMessage(userId, remoteJid, 
          `❌ Ocorreu um erro ao gerar seu pagamento: ${err?.message || 'Erro desconhecido'}. Contate o suporte.`
        );
      }
      return;
    }
  }

  async sendWhatsAppMessage(userId: string = 'admin', toJid: string, content: string): Promise<boolean> {
    const sock = this.activeSockets.get(userId);
    if (!sock) {
      this.queueMessage(userId, toJid, content);
      return false;
    }
    
    // Format JID to 55XXYYYYYYYYY@s.whatsapp.net
    let formattedJid = toJid.replace(/\D/g, '');
    if (!formattedJid.startsWith('55')) formattedJid = `55${formattedJid}`;
    if (!formattedJid.includes('@s.whatsapp.net')) formattedJid = `${formattedJid}@s.whatsapp.net`;
    
    try {
      await sock.sendPresenceUpdate('composing', formattedJid);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await sock.sendMessage(formattedJid, { text: content });
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      this.queueMessage(userId, toJid, content);
      return false;
    }
  }
  
  private queueMessage(userId: string, toJid: string, content: string) {
    const queueFile = path.join(os.tmpdir(), `baileys_queue_${userId}.json`);
    let queue = [];
    if (fs.existsSync(queueFile)) {
      try { queue = JSON.parse(fs.readFileSync(queueFile, 'utf8')); } catch (e) {}
    }
    queue.push({ toJid, content, timestamp: Date.now() });
    fs.writeFileSync(queueFile, JSON.stringify(queue));
  }
  
  public async processQueue(userId: string = 'admin') {
    const queueFile = path.join(os.tmpdir(), `baileys_queue_${userId}.json`);
    if (!fs.existsSync(queueFile)) return;
    
    try {
      let queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
      if (queue.length === 0) return;
      
      const pending = [...queue];
      fs.unlinkSync(queueFile); // Clear immediately to prevent duplicate sends
      
      for (const msg of pending) {
        await this.sendWhatsAppMessage(userId, msg.toJid, msg.content);
        await new Promise(r => setTimeout(r, 2000)); // Rate limit
      }
    } catch (e) {}
  }
  
  getQrCode(userId: string = 'admin'): string | null {
    return this.qrCodes.get(userId) || null;
  }
  
  getStatus(userId: string = 'admin'): string {
    return this.connectionStatus.get(userId) || 'disconnected';
  }
  
  logout(userId: string = 'admin') {
     const sock = this.activeSockets.get(userId);
     if (sock) {
         try { sock.logout(); } catch (e) {}
         this.activeSockets.delete(userId);
     }
     const sessionDir = path.join(process.cwd(), 'baileys_auth_info', userId);
     fs.rmSync(sessionDir, { recursive: true, force: true });
     this.connectionStatus.set(userId, 'disconnected');
  }
}

const globalForWhatsApp = global as unknown as { whatsappSpecialist: WhatsappSpecialist };
export const whatsappService = globalForWhatsApp.whatsappSpecialist || new WhatsappSpecialist();
if (process.env.NODE_ENV !== 'production') globalForWhatsApp.whatsappSpecialist = whatsappService;

// Ensure it connects on boot if previously logged in
if (fs.existsSync(path.join(process.cwd(), 'baileys_auth_info', 'admin'))) {
    whatsappService.connectWhatsApp('admin');
}
