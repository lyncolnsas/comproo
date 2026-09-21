/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WireGuardService — MikroGestor
 *
 * Comunica-se com o WireGuard Manager Daemon (Python HTTP)
 * que roda no HOST da VPS em 127.0.0.1:51821.
 *
 * ARQUITETURA:
 *   [MikroGestor Docker] ──HTTP──> [wg-manager:51821 no HOST] ──> [wg0]
 *
 * Por que daemon? O Next.js roda dentro de um container Docker e não tem
 * acesso direto às interfaces de rede do host. O daemon Python roda como
 * root no host e expõe uma API HTTP apenas em localhost.
 *
 * Requer:
 *   - vpn/setup-vps.sh executado na VPS
 *   - WG_MANAGER_URL=http://host-gateway:51821 (ou http://127.0.0.1:51821)
 *   - WG_MANAGER_SECRET=<secret gerado pelo setup>
 *   - VPS_WG_PUBLIC_KEY=<chave pública da VPS>
 *   - VPS_PUBLIC_IP=<IP público da VPS>
 */

import { prisma } from "@/lib/prisma";

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface WireGuardKeyPair {
  privateKey: string;
  publicKey: string;
}

export interface WireGuardPeerStatus {
  publicKey: string;
  endpoint: string | null;
  allowedIps: string;
  /** Timestamp Unix do último handshake */
  lastHandshake: Date | null;
  /** true se handshake < 3 minutos atrás */
  connected: boolean;
  transferRx: number;
  transferTx: number;
}

export interface RouterOSScriptParams {
  routerName: string;
  vpnIp: string;
  mikrotikPrivKey: string;
  vpsPublicKey: string;
  vpsIp: string;
  vpsPort?: number;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const WG_MANAGER_URL    = process.env.WG_MANAGER_URL    ?? "http://127.0.0.1:51821";
const WG_MANAGER_SECRET = process.env.WG_MANAGER_SECRET ?? "";
const VPN_SUBNET_BASE   = "10.8.0";
const VPN_SERVER_OCTET  = 1;
const CONNECTED_MS      = 3 * 60 * 1000;

// ─── HTTP Client ─────────────────────────────────────────────────────────────

async function wgFetch(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<{ ok: boolean; data: any; status: number }> {
  const url = `${WG_MANAGER_URL}${path}`;
  try {
    const res = await fetch(url, {
      method:  options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "X-WG-Secret":  WG_MANAGER_SECRET,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      // Timeout curto — operações locais devem ser rápidas
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, status: res.status };
  } catch (err: any) {
    // Daemon não disponível (ex: ambiente de dev local sem VPS)
    console.warn(`[WireGuard] Manager indisponível em ${url}: ${err.message}`);
    return { ok: false, data: { error: err.message }, status: 0 };
  }
}

/** Verifica se o daemon WireGuard Manager está acessível */
export async function isWireGuardAvailable(): Promise<boolean> {
  const res = await wgFetch("/health");
  return res.ok;
}

// ─── Serviço ─────────────────────────────────────────────────────────────────

export class WireGuardService {
  /**
   * Gera um par de chaves WireGuard via daemon.
   */
  async generateKeyPair(): Promise<WireGuardKeyPair> {
    const res = await wgFetch("/keygen", { method: "POST" });

    if (!res.ok) {
      // Fallback em dev: gerar placeholder
      if (process.env.NODE_ENV !== "production") {
        const id = Math.random().toString(36).slice(2, 10);
        return {
          privateKey: `DEV-PRIVKEY-${id}`,
          publicKey:  `DEV-PUBKEY-${id}`,
        };
      }
      throw new Error(`Falha ao gerar chaves: ${res.data?.error ?? "daemon indisponível"}`);
    }

    return { privateKey: res.data.privateKey, publicKey: res.data.publicKey };
  }

  /**
   * Aloca o próximo IP disponível na subnet 10.8.0.0/24.
   * Reserva .1 para o servidor VPS.
   */
  async allocateVpnIp(): Promise<string> {
    const used = await prisma.router.findMany({
      where: { vpnIp: { not: null } },
      select: { vpnIp: true },
    });

    const usedOctets = new Set<number>();
    usedOctets.add(VPN_SERVER_OCTET); // .1 = servidor

    for (const r of used) {
      const octet = r.vpnIp?.split(".")[3];
      if (octet) usedOctets.add(Number(octet));
    }

    for (let i = 2; i <= 254; i++) {
      if (!usedOctets.has(i)) return `${VPN_SUBNET_BASE}.${i}`;
    }

    throw new Error("Subnet VPN esgotada — máximo de 253 roteadores atingido.");
  }

  /**
   * Adiciona um peer ao WireGuard server via daemon.
   */
  async addPeer(publicKey: string, vpnIp: string): Promise<void> {
    const res = await wgFetch("/peer/add", {
      method: "POST",
      body: { publicKey, vpnIp },
    });
    if (!res.ok && process.env.NODE_ENV === "production") {
      throw new Error(`Falha ao adicionar peer: ${res.data?.error}`);
    }
  }

  /**
   * Remove um peer do WireGuard server via daemon.
   */
  async removePeer(publicKey: string): Promise<void> {
    const res = await wgFetch("/peer/remove", {
      method: "POST",
      body: { publicKey },
    });
    if (!res.ok) {
      console.warn(`[WireGuard] Remoção do peer falhou (não crítico): ${res.data?.error}`);
    }
  }

  /**
   * Retorna o status atual de todos os peers via daemon.
   */
  async getPeersStatus(): Promise<Record<string, WireGuardPeerStatus>> {
    const res = await wgFetch("/status");
    if (!res.ok) return {};

    const peers: Record<string, WireGuardPeerStatus> = {};
    const now = Date.now();

    for (const p of res.data.peers ?? []) {
      const lastHandshake = p.lastHandshake > 0
        ? new Date(p.lastHandshake * 1000)
        : null;
      const ageMs = lastHandshake ? now - lastHandshake.getTime() : Infinity;

      peers[p.publicKey] = {
        publicKey:    p.publicKey,
        endpoint:     p.endpoint,
        allowedIps:   p.allowedIps,
        lastHandshake,
        connected:    ageMs < CONNECTED_MS,
        transferRx:   p.transferRx,
        transferTx:   p.transferTx,
      };
    }

    return peers;
  }

  /**
   * Verifica o status de um peer específico pelo IP VPN.
   */
  async getPeerStatusByIp(vpnIp: string): Promise<WireGuardPeerStatus | null> {
    const all = await this.getPeersStatus();
    return Object.values(all).find(p => p.allowedIps.startsWith(`${vpnIp}/`)) ?? null;
  }

  /**
   * Gera o script RouterOS (.rsc) para configurar o WireGuard no MikroTik.
   * O script é idempotente — pode ser executado múltiplas vezes sem duplicar.
   */
  generateRouterOSScript(params: RouterOSScriptParams): string {
    const {
      routerName,
      vpnIp,
      mikrotikPrivKey,
      vpsPublicKey,
      vpsIp,
      vpsPort = 51820,
    } = params;

    return `# ============================================================
# MikroGestor VPN — Configuração WireGuard
# Roteador : ${routerName}
# IP VPN   : ${vpnIp}
# Gerado em: ${new Date().toISOString()}
# ============================================================
# INSTRUÇÕES:
#   1. Abra o Terminal no Winbox ou acesse via SSH
#   2. Cole este script completo e pressione Enter
#   3. O roteador se conectará automaticamente ao MikroGestor
# ============================================================

# Remover configuração anterior (se existir)
:do { /interface wireguard remove [find name=wg-mikrogestor] } on-error={}
:do { /ip address remove [find interface=wg-mikrogestor] } on-error={}
:do { /ip route remove [find comment="MikroGestor VPN route"] } on-error={}

# 1. Criar interface WireGuard
/interface wireguard add \\
  name=wg-mikrogestor \\
  private-key="${mikrotikPrivKey}" \\
  listen-port=13231 \\
  comment="MikroGestor VPN - NAO MODIFICAR"

# 2. Configurar IP na interface VPN
/ip address add \\
  address=${vpnIp}/24 \\
  interface=wg-mikrogestor \\
  network=10.8.0.0

# 3. Adicionar peer — VPS MikroGestor
/interface wireguard peers add \\
  interface=wg-mikrogestor \\
  public-key="${vpsPublicKey}" \\
  endpoint-address=${vpsIp} \\
  endpoint-port=${vpsPort} \\
  allowed-address=10.8.0.0/24 \\
  persistent-keepalive=25 \\
  comment="MikroGestor VPS"

# 4. Rota para a rede de controle VPN
/ip route add \\
  dst-address=10.8.0.0/24 \\
  gateway=wg-mikrogestor \\
  comment="MikroGestor VPN route"

# 5. Firewall — Aceitar API RouterOS apenas da VPS
:local ruleExists [/ip firewall filter find comment="MikroGestor: API access"]
:if ([:len $ruleExists] = 0) do={
  /ip firewall filter add \\
    chain=input \\
    in-interface=wg-mikrogestor \\
    src-address=10.8.0.1 \\
    dst-port=8728,8729 \\
    protocol=tcp \\
    action=accept \\
    place-before=0 \\
    comment="MikroGestor: API access"
}

# 6. Firewall — Bloquear acesso VPN de fontes não autorizadas
:local rule2Exists [/ip firewall filter find comment="MikroGestor: block non-VPS via VPN"]
:if ([:len $rule2Exists] = 0) do={
  /ip firewall filter add \\
    chain=input \\
    in-interface=wg-mikrogestor \\
    src-address=!10.8.0.1 \\
    action=drop \\
    comment="MikroGestor: block non-VPS via VPN"
}

# 7. Firewall — Impedir hotspot de usar VPN (split tunnel)
:do {
  :local r3 [/ip firewall filter find comment="MikroGestor: block hotspot thru VPN"]
  :if ([:len $r3] = 0) do={
    /ip firewall filter add \\
      chain=forward \\
      in-interface=bridge-hotspot \\
      out-interface=wg-mikrogestor \\
      action=drop \\
      comment="MikroGestor: block hotspot thru VPN"
  }
} on-error={}

:log info "MikroGestor VPN: configuracao concluida (${vpnIp})"
:put "============================================================"
:put "Configuracao concluida!"
:put "Roteador : ${routerName}"
:put "IP VPN   : ${vpnIp}"
:put "O roteador aparecera como Online no MikroGestor."
:put "============================================================"
`;
  }
}

/** Singleton para uso nas API routes */
export const wireguardService = new WireGuardService();