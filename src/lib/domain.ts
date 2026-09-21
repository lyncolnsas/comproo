/**
 * Domain & URL helper for MikroGestor.
 *
 * Suporta dois modos de deployment via variáveis de ambiente:
 *
 *  DEPLOYMENT_MODE=local (padrão)
 *    → O servidor roda na LAN. O portal do hotspot usa o IP LAN detectado
 *      ou o DNS interno "portal.wifi.local" configurado via DNS estático no MikroTik.
 *
 *  DEPLOYMENT_MODE=vps
 *    → O servidor roda em VPS com WireGuard. O portal deve usar o domínio
 *      público definido em PORTAL_PUBLIC_DOMAIN (ex: "app.empresa.com").
 *      Nunca usar IPs internos Docker (172.17.x.x) — inacessíveis para hotspot.
 */

export const DEFAULT_PORTAL_DNS = 'portal.wifi.local';

/** true quando rodando em VPS remota com WireGuard */
export function isVpsMode(): boolean {
  return process.env.DEPLOYMENT_MODE?.trim().toLowerCase() === 'vps';
}

/**
 * Retorna o domínio público configurado para modo VPS.
 * Lança erro se DEPLOYMENT_MODE=vps mas PORTAL_PUBLIC_DOMAIN não estiver definido.
 */
export function getPublicDomain(): string | null {
  const domain = process.env.PORTAL_PUBLIC_DOMAIN?.trim();
  if (!domain) return null;
  // Remove protocolo e barra final, se o usuário inseriu por engano
  return domain.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

/**
 * Retorna o domínio masked para o portal do hotspot.
 *
 * Prioridade:
 *  1. Se DEPLOYMENT_MODE=vps → PORTAL_PUBLIC_DOMAIN
 *  2. process.env.HOTSPOT_DNS_NAME (se definido explicitamente)
 *  3. reqHost SE for um nome de domínio real (não IP, não localhost)
 *  4. Fallback: 'portal.wifi.local' (DNS estático no MikroTik)
 */
export function getMaskedPortalDomain(reqHost?: string | null): string {
  // Modo VPS: usa sempre o domínio público
  if (isVpsMode()) {
    const pub = getPublicDomain();
    if (pub) return pub;
    // Aviso no log — não bloquear o sistema, usar fallback
    console.warn(
      '[domain] DEPLOYMENT_MODE=vps mas PORTAL_PUBLIC_DOMAIN não está definido. ' +
      'Hotspot pode ficar inacessível! Configure a variável de ambiente.'
    );
  }

  // HOTSPOT_DNS_NAME explícito sobrescreve tudo no modo local
  const envDns = process.env.HOTSPOT_DNS_NAME?.trim();
  if (envDns) return envDns;

  // Usa o Host header se for um domínio real
  if (reqHost) {
    const cleanHost = reqHost.trim().split(':')[0]; // strip port
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost);
    const isLocal = cleanHost === 'localhost' || cleanHost === '127.0.0.1';
    if (!isIp && !isLocal && cleanHost.length > 0) {
      return reqHost.trim();
    }
  }

  return DEFAULT_PORTAL_DNS;
}

/**
 * Retorna a URL completa (scheme + domain + path) para o portal do hotspot.
 *
 * - Modo VPS → https://PORTAL_PUBLIC_DOMAIN/path
 * - Modo local → http://portal.wifi.local/path  (ou IP LAN se reqHost for IP)
 *
 * @param path      Caminho opcional, ex: '/portal/planos'
 * @param reqHost   Host header da requisição (usado para auto-detectar domínio no modo local)
 */
export function getMaskedPortalUrl(path: string = '', reqHost?: string | null): string {
  const domain = getMaskedPortalDomain(reqHost);
  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  // VPS usa HTTPS se o domínio não for um IP privado nem .local
  const isPrivate = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(domain);
  const isLocal   = domain.endsWith('.local') || domain === 'localhost';
  const scheme    = (isVpsMode() && !isPrivate && !isLocal) ? 'https' : 'http';

  return `${scheme}://${domain}${normalizedPath}`;
}
