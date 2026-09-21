/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RouterOSClient, RosApiMenu } from 'routeros-client';

// ─── Patch para RouterOS v7 (!empty replies) ──────────────────────────────────
// No RouterOS v7, consultas a tabelas vazias retornam a sentença "!empty" antes
// de "!done". A biblioteca 'node-routeros' desconhece "!empty" e lança RosException
// dentro de Channel.onUnknown. Este patch trata "!empty" de forma nativa e segura.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Channel } = require('node-routeros/dist/Channel');
  if (Channel && Channel.prototype && !(Channel.prototype as any)._ros7Patched) {
    (Channel.prototype as any)._ros7Patched = true;
    const origProcessPacket = Channel.prototype.processPacket;
    Channel.prototype.processPacket = function (packet: string[]) {
      const reply = packet[0];
      if (reply === '!empty') {
        this.data = [];
        return;
      }
      return origProcessPacket.call(this, packet);
    };
    Channel.prototype.onUnknown = function (reply: string) {
      if (reply === '!empty') {
        this.data = [];
        return;
      }
      console.warn('[MikroTik] Unhandled reply from RouterOS:', reply);
    };
  }
} catch (e) {
  console.warn('[MikrotikAPI] Falha ao aplicar patch para RouterOS v7:', e);
}

export class MikrotikAPI {
  private client: RosApiMenu | null = null;
  private connection: RouterOSClient | null = null;

  async connect(host: string, user: string, pass: string, port?: number) {
    this.connection = new RouterOSClient({
      host,
      port: port || 8728,
      user,
      password: pass,
      keepalive: true,
      timeout: 2500
    });

    try {
      this.client = await this.connection.connect();
      return true;
    } catch (err) {
      console.error('Mikrotik Connection Error:', err);
      return false;
    }
  }

  async close() {
    this.disconnect();
  }

  async getIdentity() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/system/identity');
    return await menu.get();
  }

  async getSystemResources() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/system/resource');
    return await menu.get();
  }

  async getRouterboard() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/system/routerboard');
    return await menu.get();
  }

  async getSystemClock() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/system/clock');
    return await menu.get();
  }

  async getLogs() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/log');
    return await menu.get();
  }

  async getHotspotActive() {
    if (!this.client) throw new Error('Not connected');
    try {
      const menu = this.client.menu('/ip/hotspot/active');
      return await menu.get();
    } catch (err: any) {
      if (err?.message && (err.message.includes('!empty') || err.message.includes('empty'))) {
        return [];
      }
      throw err;
    }
  }

  async getHotspotUsers() {
    if (!this.client) throw new Error('Not connected');
    try {
      const menu = this.client.menu('/ip/hotspot/user');
      return await menu.get();
    } catch (err: any) {
      if (err?.message && (err.message.includes('!empty') || err.message.includes('empty'))) {
        return [];
      }
      throw err;
    }
  }

  async getHotspotProfiles() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/user/profile');
    return await menu.get();
  }

  async addHotspotProfile(profile: any) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/user/profile');
    return await menu.add(profile);
  }

  async updateHotspotProfile(profile: any, id: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/user/profile');
    return await menu.set(profile, id);
  }

  async getHotspotServers() {
    if (!this.client) throw new Error('Not connected');
    // Correct RouterOS path: /ip/hotspot (NOT /ip/hotspot/server which doesn't exist)
    return await this.client.menu('/ip/hotspot').get();
  }

  async addHotspotUser(user: any) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/user');
    return await menu.add(user);
  }

  async removeHotspotUser(id: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/user');
    return await menu.remove(id);
  }

  async removeHotspotUsersByComment(comment: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/user');
    const users = await menu.where('comment', comment).get();
    let count = 0;
    for (const u of users) {
      if (u.id) {
        await menu.remove(u.id);
        count++;
      }
    }
    return count;
  }


  /** Remove active hotspot sessions for a given MAC address */
  async removeHotspotActiveByMac(mac: string): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    const active = await this.client.menu('/ip/hotspot/active').where('mac-address', mac).get() as any[];
    for (const u of active) {
      const id: string | undefined = u['.id'] ?? u.id;
      if (id) await this.client.menu('/ip/hotspot/active').remove(id);
    }
  }

  /** Enable a hotspot user by ID (sets disabled=false) */
  async enableHotspotUser(id: string): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    await this.client.menu('/ip/hotspot/user').update({ '.id': id, disabled: 'false' });
  }

  /** Disable a hotspot user by ID (sets disabled=true) */
  async disableHotspotUser(id: string): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    await this.client.menu('/ip/hotspot/user').update({ '.id': id, disabled: 'true' });
  }

  /** Returns all active hotspot sessions */
  async getActiveHotspotUsers(): Promise<any[]> {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/hotspot/active').get() as any[];
  }

  /** Remove a specific active hotspot session by its ID */
  async removeActiveHotspotUser(id: string): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    await this.client.menu('/ip/hotspot/active').remove(id);
  }

  /** Remove active sessions matching a username */
  async removeHotspotActiveByUser(username: string): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    const active = await this.client.menu('/ip/hotspot/active').where('user', username).get() as any[];
    for (const u of active) {
      const id: string | undefined = u['.id'] ?? u.id;
      if (id) await this.client.menu('/ip/hotspot/active').remove(id);
    }
  }

  /** Remove hotspot users matching a username */
  async removeHotspotUserByName(username: string): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    const users = await this.client.menu('/ip/hotspot/user').where('name', username).get() as any[];
    for (const u of users) {
      const id: string | undefined = u['.id'] ?? u.id;
      if (id) await this.client.menu('/ip/hotspot/user').remove(id);
    }
  }

  async updateCaptivePortal(htmlContent: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/file');
    
    let files = await menu.where('name', 'hotspot/login.html').get();
    if (files.length === 0) {
      files = await menu.where('name', 'flash/hotspot/login.html').get();
    }
    
    if (files.length > 0) {
      const fileId = files[0].id;
      await menu.set({ contents: htmlContent }, fileId);
      return { success: true, path: files[0].name };
    } else {
      throw new Error('Arquivo login.html não encontrado na pasta hotspot do Mikrotik.');
    }
  }

  // --- SECURITY & ACCESS CONTROL --- //

  async getWalledGarden() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/walled-garden');
    return await menu.get();
  }

  async addWalledGarden(action: 'allow' | 'deny', dstHost: string, comment: string = '') {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/walled-garden');
    return await menu.add({
      action: action,
      'dst-host': `*${dstHost}*`, // wildcard to match subdomains
      comment: `MikroGestor: ${comment}`
    });
  }

  async removeWalledGarden(id: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/walled-garden');
    return await menu.remove(id);
  }

  async getWalledGardenIp() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/walled-garden/ip');
    return await menu.get();
  }

  async addWalledGardenIp(action: 'accept' | 'reject' | 'drop', dstAddressOrHost: string, comment: string = '') {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/walled-garden/ip');
    const clean = dstAddressOrHost.replace(/^\*+|\*+$/g, '');
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/.test(clean);
    const data: any = {
      action: action,
      comment: `MikroGestor: ${comment}`
    };
    if (isIp) {
      data['dst-address'] = clean;
    } else {
      data['dst-host'] = clean;
    }
    return await menu.add(data);
  }

  async removeWalledGardenIp(id: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot/walled-garden/ip');
    return await menu.remove(id);
  }

  async setTimeBlockRule(startTime: string, endTime: string, days: string, comment: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/firewall/filter');
    // time format: start-end,days -> e.g. 22:00:00-06:00:00,sun,mon,tue,wed,thu,fri,sat
    return await menu.add({
      chain: 'forward',
      action: 'drop',
      time: `${startTime}-${endTime},${days}`,
      comment: `MikroGestor Bloqueio Horario: ${comment}`
    });
  }

  async getTimeBlockRules() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/firewall/filter');
    const rules = await menu.get();
    return rules.filter((r: any) => r.comment && r.comment.startsWith('MikroGestor Bloqueio Horario:'));
  }

  async removeTimeBlockRule(id: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/firewall/filter');
    return await menu.remove(id);
  }

  /** Returns ALL rules in /ip/firewall/filter (used by the provisioning audit) */
  async getAllFirewallFilterRules(): Promise<any[]> {
    if (!this.client) throw new Error('Not connected');
    try {
      return await this.client.menu('/ip/firewall/filter').get() as any[];
    } catch {
      return [];
    }
  }

  // --- PPP / PPPoE --- //
  async getPppSecrets() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ppp/secret');
    return await menu.get();
  }

  // --- DHCP LEASES --- //
  async getDhcpLeases() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/dhcp-server/lease');
    return await menu.get();
  }

  // --- TRAFFIC MONITOR --- //
  async getInterfaces() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/interface');
    return await menu.get();
  }

  async getTraffic(interfaceName: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/interface');
    // Executes: /interface/monitor-traffic interface=interfaceName once=yes
    const traffic = await menu.exec('monitor-traffic', { interface: interfaceName, once: true });
    return traffic;
  }

  // --- IP ADDRESSES, POOLS, DHCP & NAT (PROVISIONING) --- //
  async getIpAddresses() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/address').get();
  }

  async addIpAddress(address: string, network: string, interfaceName: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/address').add({
      address,
      network,
      interface: interfaceName
    });
  }

  async getIpPools() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/pool').get();
  }

  async addIpPool(name: string, ranges: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/pool').add({
      name,
      ranges
    });
  }

  async getDhcpNetworks() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/dhcp-server/network').get();
  }

  async addDhcpServerNetwork(address: string, gateway: string, dns: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/dhcp-server/network').add({
      address,
      gateway,
      'dns-server': dns
    });
  }

  async getDhcpServers() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/dhcp-server').get();
  }

  async addDhcpServer(name: string, interfaceName: string, poolName: string, leaseTime: string = '00:30:00') {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/dhcp-server').add({
      name,
      interface: interfaceName,
      'address-pool': poolName,
      'lease-time': leaseTime,
      'add-arp': 'yes',
      disabled: 'no'
    });
  }

  async getSimpleQueues() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/queue/simple').get();
  }

  async getSchedulers() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/system/scheduler').get();
  }

  async addScheduler(params: any) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/system/scheduler').add(params);
  }

  async setScheduler(params: any, id: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/system/scheduler').set(params, id);
  }

  async removeScheduler(id: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/system/scheduler').remove(id);
  }

  async getSystemScripts() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/system/script').get();
  }

  async removeSystemScript(id: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/system/script').remove(id);
  }

  // --- HOTSPOT SERVERS AND SERVER PROFILES --- //
  async getHotspotServerProfiles() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/hotspot/profile').get();
  }

  async addHotspotServerProfile(profile: any) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/hotspot/profile').add(profile);
  }

  async addHotspotServer(server: any) {
    if (!this.client) throw new Error('Not connected');
    // Correct path: /ip/hotspot (NOT /ip/hotspot/server)
    return await this.client.menu('/ip/hotspot').add(server);
  }

  /**
   * Smart upsert: checks state and creates/enables/corrects the hotspot server as needed.
   * Returns { action: 'created' | 'enabled' | 'updated' | 'already_active', id: string }
   */
  async upsertHotspotServer(server: {
    name: string;
    interface: string;
    'address-pool': string;
    profile: string;
    disabled?: string;
  }): Promise<{ action: string; id?: string; existing?: any }> {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/hotspot');
    const existing = await menu.get() as any[];

    // Check by name OR by interface (same interface = same logical server)
    const byName  = existing.find((s: any) => s.name === server.name);
    const byIface = existing.find((s: any) => s.interface === server.interface);
    const found   = byName || byIface;

    if (found) {
      const isDisabled = found.disabled === 'true' || found.disabled === 'yes';
      const isMismatched = found['address-pool'] !== server['address-pool'] || found.profile !== server.profile;
      
      if (isDisabled || isMismatched) {
        await menu.where('.id', found.id).update({
          disabled: 'no',
          'address-pool': server['address-pool'],
          profile: server.profile
        });
        return { action: 'updated', id: found.id, existing: found };
      }
      // Already active and correct
      return { action: 'already_active', id: found.id, existing: found };
    }

    // Doesn't exist — create it
    const id = await menu.add({ ...server, disabled: 'no' });
    return { action: 'created', id };
  }

  async getNatRules() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/firewall/nat').get();
  }

  async addNatMasquerade(srcAddress: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/firewall/nat').add({
      chain: 'srcnat',
      'src-address': srcAddress,
      action: 'masquerade',
      comment: 'MikroGestor NAT Masquerade'
    });
  }

  async addNatMasqueradeWan(wanInterface: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/firewall/nat').add({
      chain: 'srcnat',
      'out-interface': wanInterface,
      action: 'masquerade',
      comment: `MikroGestor NAT WAN: ${wanInterface}`
    });
  }


  // --- KEYWORD FIREWALL BLOCKING --- //
  async getKeywordBlockRules() {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/firewall/filter');
    const list = await menu.get();
    return list.filter((r: any) => r.comment && r.comment.startsWith('MikroGestor Bloqueio Palavra:'));
  }

  async addKeywordBlockRule(keyword: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/firewall/filter');
    
    // 1. Add TCP 443 tls-host drop rule
    await menu.add({
      chain: 'forward',
      protocol: 'tcp',
      'dst-port': '443',
      'tls-host': `*${keyword}*`,
      action: 'drop',
      comment: `MikroGestor Bloqueio Palavra: ${keyword} (HTTPS)`
    });

    // 2. Add TCP 80 content drop rule
    await menu.add({
      chain: 'forward',
      protocol: 'tcp',
      'dst-port': '80',
      content: keyword,
      action: 'drop',
      comment: `MikroGestor Bloqueio Palavra: ${keyword} (HTTP)`
    });
  }

  async removeKeywordBlockRules(keyword: string) {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/firewall/filter');
    const rules = await menu.get();
    for (const r of rules) {
      if (r.comment && r.comment.startsWith(`MikroGestor Bloqueio Palavra: ${keyword}`)) {
        await menu.remove(r.id);
      }
    }
  }

  async isProvisionedByMikroGestor(): Promise<boolean> {
    if (!this.client) throw new Error('Not connected');

    // Check 1: System Note contains MikroGestor
    try {
      const notes = await this.client.menu('/system/note').get() as any[];
      if (notes && notes.length > 0 && notes[0].note && notes[0].note.includes('MikroGestor:PROVISIONED')) {
        return true;
      }
    } catch (e) {
      // note not found or error, continue
    }

    // Check 2: System Script named MikroGestor_PROVISIONED
    try {
      const scripts = await this.client.menu('/system/script').get() as any[];
      if (scripts && scripts.some((s: any) => s.name === 'MikroGestor_PROVISIONED')) {
        return true;
      }
    } catch (e) {
      // script not found or error, continue
    }

    // Check 3: Bridge comment contains PROVISIONED
    try {
      const bridges = await this.getBridges();
      const ours = bridges.find((b: any) => b.name === 'bridge-hotspot');
      if (ours && ours.comment && ours.comment.includes('PROVISIONED')) {
        return true;
      }
    } catch (e) {
      // bridge check failed
    }

    // Check 4: Hotspot comment contains PROVISIONED
    try {
      const servers = await this.getHotspotServers();
      const ours = servers.find((s: any) => s.name === 'hs_hotspot' || s.interface === 'bridge-hotspot');
      if (ours && ours.comment && ours.comment.includes('PROVISIONED')) {
        return true;
      }
    } catch (e) {
      // hotspot check failed
    }

    return false;
  }

  async writeProvisioningSignature(): Promise<void> {
    if (!this.client) throw new Error('Not connected');

    // 1. Create a dummy script /system/script MikroGestor_PROVISIONED
    try {
      const scriptMenu = this.client.menu('/system/script');
      const existing = await scriptMenu.get() as any[];
      const already = existing.some((s: any) => s.name === 'MikroGestor_PROVISIONED');
      if (!already) {
        await scriptMenu.add({
          name: 'MikroGestor_PROVISIONED',
          comment: 'MikroGestor:PROVISIONED',
          source: '# Provisionado por MikroGestor'
        });
      }
    } catch (e) {
      console.warn('Failed to write signature to system script:', e);
    }

    // 2. Set System Note /system/note
    try {
      const noteMenu = this.client.menu('/system/note');
      await noteMenu.set({ note: 'MikroGestor:PROVISIONED' });
    } catch (e) {
      console.warn('Failed to write signature to system note:', e);
    }

    // 3. Set comment on bridge-hotspot
    try {
      const bridgeMenu = this.client.menu('/interface/bridge');
      const bridges = await bridgeMenu.get() as any[];
      const ours = bridges.find((b: any) => b.name === 'bridge-hotspot');
      if (ours && ours.id) {
        await bridgeMenu.where('.id', ours.id).update({ comment: 'MikroGestor Bridge — PROVISIONED' });
      }
    } catch (e) {
      console.warn('Failed to write signature to bridge comment:', e);
    }

    // 4. Set comment on hs_hotspot server
    try {
      const hsMenu = this.client.menu('/ip/hotspot');
      const servers = await hsMenu.get() as any[];
      const ours = servers.find((s: any) => s.name === 'hs_hotspot' || s.interface === 'bridge-hotspot');
      if (ours && ours.id) {
        await hsMenu.where('.id', ours.id).update({ comment: 'MikroGestor Hotspot — PROVISIONED' });
      }
    } catch (e) {
      console.warn('Failed to write signature to hotspot comment:', e);
    }
  }

  async ensureApiAccessNotBlocked(): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    const menu = this.client.menu('/ip/firewall/filter');
    try {
      const rules = await menu.get() as any[];

      // ── 1. API RouterOS (8728 plain + 8729 SSL) ───────────────────────────
      const apiRule = rules.find((r: any) => r.comment === 'MikroGestor: Accept API Access');
      if (!apiRule) {
        const addParams: any = {
          chain: 'input',
          protocol: 'tcp',
          'dst-port': '8728,8729',
          action: 'accept',
          comment: 'MikroGestor: Accept API Access'
        };
        // Posiciona no topo apenas se já existir alguma regra
        if (rules.length > 0 && rules[0]['.id']) {
          addParams['place-before'] = rules[0]['.id'];
        }
        await menu.add(addParams);
      } else if (apiRule.disabled === 'true' || apiRule.disabled === 'yes') {
        await menu.where('.id', apiRule.id).update({ disabled: 'no' });
      }

      // ── 2. Winbox (8291) ──────────────────────────────────────────────────
      // Re-fetch so indexes are accurate after possible insert above
      const rulesAfterApi = await menu.get() as any[];
      const winboxRule = rulesAfterApi.find((r: any) => r.comment === 'MikroGestor: Accept Winbox');
      if (!winboxRule) {
        const addParams: any = {
          chain: 'input',
          protocol: 'tcp',
          'dst-port': '8291',
          action: 'accept',
          comment: 'MikroGestor: Accept Winbox'
        };
        if (rulesAfterApi.length > 0 && rulesAfterApi[0]['.id']) {
          addParams['place-before'] = rulesAfterApi[0]['.id'];
        }
        await menu.add(addParams);
      } else if (winboxRule.disabled === 'true' || winboxRule.disabled === 'yes') {
        await menu.where('.id', winboxRule.id).update({ disabled: 'no' });
      }
    } catch (e) {
      console.warn('Failed to ensure firewall API/Winbox rules:', e);
    }
  }

  /**
   * Registra o IP/MAC do servidor no MikroTik para garantir acesso administrativo.
   *
   * MODO LOCAL (DEPLOYMENT_MODE=local ou não definido):
   *   1. /ip/arp  — entrada ARP estática na bridge LAN (garante alcançabilidade)
   *   2. /ip/hotspot/ip-binding — type=bypassed (admin nunca vê captive portal)
   *   3. /ip/dns/static — portal.wifi.local → IP LAN do servidor
   *   4. /ip/hotspot/walled-garden — libera IP LAN e portal.wifi.local
   *
   * MODO VPS (DEPLOYMENT_MODE=vps):
   *   • Não cria ARP/IP-binding com IP Docker (inacessível para hotspot)
   *   • NÃO cria DNS estático portal.wifi.local → IP Docker (causaria bloqueio!)
   *   • Walled Garden libera o DOMÍNIO PÚBLICO (publicDomain) e o IP VPN (10.8.0.1)
   *   • Force DNS (redirect porta 53) é mantido em ambos os modos
   */
  async ensureAdminArpAndBypass(
    adminIp: string,
    bridgeName: string,
    adminMac?: string,
    opts?: { mode?: 'local' | 'vps'; publicDomain?: string }
  ): Promise<{ arp: string; bypass: string }> {
    if (!this.client) throw new Error('Not connected');
    const result = { arp: '', bypass: '' };
    const isVps = opts?.mode === 'vps';
    const publicDomain = opts?.publicDomain?.trim() || '';

    // ── ARP + IP Binding: apenas no modo LOCAL ────────────────────────────────
    // No modo VPS o container Docker não tem IP roteável pelo hotspot dos clientes.
    // Adicionar o IP Docker à tabela ARP/IP-Binding não tem efeito útil e pode
    // confundir o diagnóstico de rede.
    if (!isVps) {
      // ARP table
      try {
        const arpMenu = this.client.menu('/ip/arp');
        const arpEntries = await arpMenu.get() as any[];
        const existingArp = arpEntries.find(
          (e: any) => e.address === adminIp && (e.interface === bridgeName || e.comment?.includes('MikroGestor'))
        );
        if (!existingArp) {
          const arpParams: any = {
            address: adminIp,
            interface: bridgeName,
            comment: 'MikroGestor: Admin System IP'
          };
          if (adminMac) arpParams['mac-address'] = adminMac;
          await arpMenu.add(arpParams);
          result.arp = `IP ${adminIp} adicionado à tabela ARP na interface ${bridgeName}.`;
        } else {
          result.arp = `IP ${adminIp} já presente na tabela ARP.`;
        }
      } catch (e: any) {
        result.arp = `ARP: ${e?.message || 'erro desconhecido (não crítico).'}`;
        console.warn('Failed to add ARP entry:', e);
      }

      // Hotspot IP Binding (bypassed)
      try {
        const bindMenu = this.client.menu('/ip/hotspot/ip-binding');
        const bindings = await bindMenu.get() as any[];
        const existingBind = bindings.find(
          (b: any) => b.address === adminIp && b.type === 'bypassed'
        );
        if (!existingBind) {
          const bindParams: any = {
            address: adminIp,
            type: 'bypassed',
            comment: 'MikroGestor: Admin System IP — bypass automático'
          };
          if (adminMac) bindParams['mac-address'] = adminMac;
          await bindMenu.add(bindParams);
          result.bypass = `IP ${adminIp} (MAC: ${adminMac || 'N/A'}) adicionado ao Hotspot como bypassed.`;
        } else {
          result.bypass = `IP ${adminIp} já está bypassed no Hotspot.`;
        }
      } catch (e: any) {
        result.bypass = `Bypass: ${e?.message || 'erro desconhecido (não crítico).'}`;
        console.warn('Failed to add hotspot bypass binding:', e);
      }
    } else {
      result.arp    = 'Modo VPS: ARP estático ignorado (IP Docker não roteável pelo hotspot).';
      result.bypass = 'Modo VPS: IP Binding ignorado (IP Docker não roteável pelo hotspot).';
    }

    // ── Walled Garden (HTTP Porta 80) ─────────────────────────────────────────
    // LOCAL: libera IP LAN do servidor + portal.wifi.local
    // VPS:   libera domínio público + gateways essenciais
    try {
      const wgMenu = this.client.menu('/ip/hotspot/walled-garden');
      const list = await wgMenu.get() as any[];

      const addWgEntry = async (host: string, comment: string) => {
        if (!host) return;
        const wildcard = `*${host}*`;
        const exists = list.some((item: any) => item['dst-host'] === wildcard || item['dst-host'] === host);
        if (!exists) {
          await wgMenu.add({
            action: 'allow',
            'dst-host': wildcard,
            comment: `MikroGestor: ${comment}`
          }).catch(() => null);
        }
      };

      if (!isVps) {
        await addWgEntry(adminIp, 'Auto-Cadastro / API');
        await addWgEntry('portal.wifi.local', 'Auto-Cadastro / API DNS');
      } else {
        if (publicDomain) {
          await addWgEntry(publicDomain, 'Portal Publico VPS');
          await addWgEntry(`www.${publicDomain}`, 'Portal Publico WWW');
        }
        const essentialDomains = [
          'mercadopago.com',
          'mercadopago.com.br',
          'mercadolivre.com.br',
          'mercadolibre.com',
          'whatsapp.com',
          'whatsapp.net'
        ];
        for (const d of essentialDomains) {
          await addWgEntry(d, `Integracao ${d}`);
        }
      }
    } catch (e: any) {
      console.warn('Failed to configure walled garden during provisioning:', e);
    }

    // ── Walled Garden IP (HTTPS Porta 443 + IP Bypass) ─────────────────────────
    // REGRA CRÍTICA: O MikroTik Hotspot bloqueia TODO o tráfego HTTPS (porta 443) para
    // clientes não autenticados, a menos que o destino esteja aceito em /ip/hotspot/walled-garden/ip!
    // ATENÇÃO: No RouterOS v7, 'dst-host' em walled-garden/ip NÃO aceita asteriscos (fica invalid: true).
    // Deve ser cadastrado o hostname exato (ex: 'mikrogestor.com') ou o endereço IP ('dst-address').
    try {
      const wgIpMenu = this.client.menu('/ip/hotspot/walled-garden/ip');
      const listIp = await wgIpMenu.get() as any[];

      // Limpeza preventiva de regras com asterisco que ficaram inválidas
      for (const item of listIp) {
        if (item.invalid === true || item.invalid === 'true' || (item['dst-host'] && item['dst-host'].includes('*'))) {
          const itemId = item['.id'] || item.id;
          if (itemId) {
            await wgIpMenu.remove(itemId).catch(() => null);
          }
        }
      }

      const addWgIpAddress = async (ip: string, comment: string) => {
        if (!ip) return;
        const exists = listIp.some((item: any) => item['dst-address'] === ip && item.action === 'accept');
        if (!exists) {
          await wgIpMenu.add({
            action: 'accept',
            'dst-address': ip,
            comment: `MikroGestor: ${comment}`
          }).catch(() => null);
        }
      };

      const addWgIpHost = async (host: string, comment: string) => {
        if (!host) return;
        const clean = host.replace(/^\*+|\*+$/g, '');
        const exists = listIp.some((item: any) => item['dst-host'] === clean && item.action === 'accept');
        if (!exists) {
          await wgIpMenu.add({
            action: 'accept',
            'dst-host': clean,
            comment: `MikroGestor: ${comment}`
          }).catch(() => null);
        }
      };

      if (!isVps) {
        await addWgIpAddress(adminIp, 'Auto-Cadastro / API IP');
      } else {
        // 1. Hostnames do sistema MikroGestor (HTTPS liberado para clientes antes do login)
        if (publicDomain) {
          await addWgIpHost(publicDomain, 'Dominio Publico (HTTPS)');
          await addWgIpHost(`www.${publicDomain}`, 'WWW Dominio Publico (HTTPS)');
        }
        // 2. IP Público da VPS
        const VPS_PUBLIC_IP = process.env.VPS_PUBLIC_IP;
        if (VPS_PUBLIC_IP) {
          await addWgIpAddress(VPS_PUBLIC_IP, 'VPS IP Publico (HTTPS)');
        }
        // 3. IP VPN do Servidor (controle)
        const VPN_SERVER_IP = process.env.VPN_SERVER_IP || '10.8.0.1';
        await addWgIpAddress(VPN_SERVER_IP, 'IP VPN Servidor');

        // 4. Gateways de Pagamento (Mercado Pago), WhatsApp e Fontes (para o portal carregar completo em HTTPS)
        const externalHosts = [
          'mercadopago.com',
          'www.mercadopago.com',
          'mercadopago.com.br',
          'www.mercadopago.com.br',
          'api.mercadopago.com',
          'api.mercadolibre.com',
          'mercadolivre.com.br',
          'www.mercadolivre.com.br',
          'whatsapp.com',
          'web.whatsapp.com',
          'api.whatsapp.com',
          'whatsapp.net',
          'fonts.googleapis.com',
          'fonts.gstatic.com'
        ];
        for (const h of externalHosts) {
          await addWgIpHost(h, `Integracao ${h} (HTTPS)`);
        }

        // 5. Limpeza de static DNS para portal.wifi.local que causa conflito
        try {
          const dnsStatic = this.client.menu('/ip/dns/static');
          const statics = await dnsStatic.get() as any[];
          const legacy = statics.filter((s: any) => s.name === 'portal.wifi.local');
          for (const s of legacy) {
            const sid = s['.id'] || s.id;
            if (sid) await dnsStatic.remove(sid).catch(() => null);
          }
        } catch (dnsErr) {}
      }
    } catch (e: any) {
      console.warn('Failed to add walled garden IP bypass during provisioning:', e);
    }

    // ── Force DNS (Redirect & Block Private DNS) — ambos os modos ────────────
    try {
      await this.client.menu('/ip/dns').set({ 'allow-remote-requests': 'yes' }).catch(() => null);

      const filterMenu = this.client.menu('/ip/firewall/filter');
      const filters = await filterMenu.get() as any[];
      if (!filters.find((f: any) => f['dst-port'] === '853' && f.chain === 'forward')) {
        await filterMenu.add({ chain: 'forward', protocol: 'tcp', 'dst-port': '853', action: 'drop', comment: 'Block Private DNS (DoT)', 'place-before': '0' }).catch(() => null);
      }
      if (!filters.find((f: any) => f['dst-port'] === '853' && f.chain === 'input')) {
        await filterMenu.add({ chain: 'input', protocol: 'tcp', 'dst-port': '853', action: 'drop', comment: 'Block Private DNS (DoT)', 'place-before': '0' }).catch(() => null);
      }

      const natMenu = this.client.menu('/ip/firewall/nat');
      const nats = await natMenu.get() as any[];
      if (!nats.find((n: any) => n['dst-port'] === '53' && n.protocol === 'udp' && n.action === 'redirect')) {
        await natMenu.add({ chain: 'dstnat', protocol: 'udp', 'dst-port': '53', action: 'redirect', 'to-ports': '53', comment: 'Force local DNS UDP', 'place-before': '0' }).catch(() => null);
      }
      if (!nats.find((n: any) => n['dst-port'] === '53' && n.protocol === 'tcp' && n.action === 'redirect')) {
        await natMenu.add({ chain: 'dstnat', protocol: 'tcp', 'dst-port': '53', action: 'redirect', 'to-ports': '53', comment: 'Force local DNS TCP', 'place-before': '0' }).catch(() => null);
      }
    } catch (e) {
      console.warn('Failed to force DNS during provisioning:', e);
    }

    // ── Static DNS: portal.wifi.local → IP do Servidor ────────────────────────
    // MODO LOCAL: cria/atualiza entrada DNS estática apontando para IP LAN
    // MODO VPS:   NÃO cria DNS estático!
    //   Razão: no modo VPS, o "adminIp" é um IP Docker interno (172.17.x.x),
    //   que é completamente inacessível para clientes do hotspot. Criar esse
    //   DNS faria portal.wifi.local resolver para um IP morto, bloqueando
    //   todo o acesso ao portal de login do hotspot.
    //   No modo VPS o hotspot usa o PORTAL_PUBLIC_DOMAIN diretamente.
    if (!isVps) {
      try {
        const dnsMenu = this.client.menu('/ip/dns/static');
        const list = await dnsMenu.get() as any[];
        const exists = list.find((d: any) => d.name === 'portal.wifi.local' && d.address === adminIp);
        if (!exists) {
          // Remove entradas antigas de portal.wifi.local
          const olds = list.filter((d: any) => d.name === 'portal.wifi.local');
          for (const old of olds) {
            await dnsMenu.remove(old.id || old['.id']);
          }
          await dnsMenu.add({
            name: 'portal.wifi.local',
            address: adminIp,
            comment: 'MikroGestor: Magic Link DNS'
          });
        }
      } catch (e: any) {
        console.warn('Failed to add static DNS during provisioning:', e);
      }
    } else {
      console.log('[Provision VPS] DNS estático portal.wifi.local NÃO criado (modo VPS — usando domínio público).');
    }

    return result;
  }

  disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
      this.client = null;
    }
  }

  // --- BRIDGE MANAGEMENT --- //

  async getBridges() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/interface/bridge').get();
  }

  async addBridge(name: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/interface/bridge').add({
      name,
      'auto-mac': 'yes',
      comment: 'MikroGestor Bridge'
    });
  }

  async getBridgePorts() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/interface/bridge/port').get();
  }

  async addBridgePort(bridgeName: string, interfaceName: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/interface/bridge/port').add({
      bridge: bridgeName,
      interface: interfaceName,
      comment: 'MikroGestor Port'
    });
  }

  // --- HOTSPOT IP BINDING --- //

  async getHotspotIpBindings() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/hotspot/ip-binding').get();
  }

  async addHotspotIpBinding(address: string, type: 'bypassed' | 'blocked' | 'regular', comment: string = '', macAddress?: string) {
    if (!this.client) throw new Error('Not connected');
    const params: any = {
      address: address,
      type: type,
      comment: `MikroGestor: ${comment}`
    };
    if (macAddress) {
      params['mac-address'] = macAddress;
    }
    return await this.client.menu('/ip/hotspot/ip-binding').add(params);
  }

  async removeHotspotIpBinding(id: string) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/hotspot/ip-binding').remove(id);
  }

  async updateHotspotUser(id: string, params: Record<string, any>) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/hotspot/user').update({ '.id': id, ...params });
  }

  async updateHotspotIpBinding(id: string, params: Record<string, any>) {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/ip/hotspot/ip-binding').update({ '.id': id, ...params });
  }

  // --- DEFAULT HOTSPOT USER PROFILE --- //

  async addHotspotUserProfile(profile: {
    name: string;
    rateLimit?: string;
    sessionTimeout?: string;
    sharedUsers?: string;
  }) {
    if (!this.client) throw new Error('Not connected');
    const params: any = { name: profile.name };
    if (profile.rateLimit) params['rate-limit'] = profile.rateLimit;
    if (profile.sessionTimeout) params['session-timeout'] = profile.sessionTimeout;
    if (profile.sharedUsers) params['shared-users'] = profile.sharedUsers;
    return await this.client.menu('/ip/hotspot/user/profile').add(params);
  }

  // --- SYSTEM PACKAGES --- //

  async getPackages() {
    if (!this.client) throw new Error('Not connected');
    return await this.client.menu('/system/package').get();
  }

  // --- SMART HOTSPOT DIAGNOSTICS --- //

  async checkHotspot(): Promise<{
    available: boolean;
    version: string;
    majorVersion: number;
    installedPackages: string[];
    probeError: string;
  }> {
    let version = 'desconhecida';
    let installedPackages: string[] = [];
    let probeError = '';

    // 1. Get RouterOS version
    try {
      const res = await this.getSystemResources();
      version = res[0]?.version || 'desconhecida';
    } catch { /* ignore */ }

    // 2. List installed packages (names only, no disabled flag for matching)
    try {
      const pkgs = await this.client!.menu('/system/package').get();
      installedPackages = (pkgs as any[]).map((p: any) => p.name);
    } catch { /* ignore */ }

    const majorVersion = parseInt(version.split('.')[0] || '0', 10);

    // 3. SMART DETECTION — version-aware
    //
    //  RouterOS 7.x: hotspot is ALWAYS included in the base 'routeros' package.
    //  No separate 'hotspot' package exists in v7 — it's part of the core system.
    //  Checking for 'routeros' package presence is the correct signal.
    //
    //  RouterOS 6.x: hotspot was a SEPARATE optional package named 'hotspot'.
    //
    if (majorVersion >= 7) {
      const hasBasePackage = installedPackages.some(p => p === 'routeros' || p === 'system');
      if (hasBasePackage) {
        // RouterOS 7.x with base package = hotspot is always available
        return { available: true, version, majorVersion, installedPackages, probeError: '' };
      }
    }

    // 4. RouterOS 6.x or unknown version: check for explicit hotspot package
    const hasHotspotPkg = installedPackages.some(p =>
      p === 'hotspot' || p === 'advanced-tools'
    );
    if (hasHotspotPkg) {
      return { available: true, version, majorVersion, installedPackages, probeError: '' };
    }

    // 5. Last resort: live probe (catches edge cases)
    try {
      await this.client!.menu('/ip/hotspot').get();
      return { available: true, version, majorVersion, installedPackages, probeError: '' };
    } catch (e: any) {
      probeError = e?.message || 'erro desconhecido';
      return { available: false, version, majorVersion, installedPackages, probeError };
    }
  }

  /** @deprecated Use checkHotspot() instead */
  async isHotspotAvailable(): Promise<boolean> {
    const result = await this.checkHotspot();
    return result.available;
  }
}

// Singleton for API across requests if needed, but in serverless/Next.js edge we might need to handle sessions.
// For now, we'll instantiate it per request based on cookies.
