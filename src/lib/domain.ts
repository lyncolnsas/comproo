/**
 * Domain & URL helper for MikroGestor.
 * Guarantees customer-facing URLs use the MikroTik DNS masquerading domain (e.g. portal.wifi.local)
 * instead of leaking raw server IP addresses (e.g. 192.168.88.254).
 */

export const DEFAULT_PORTAL_DNS = 'portal.wifi.local';

/**
 * Returns the masked portal domain name.
 * Priority:
 * 1. process.env.HOTSPOT_DNS_NAME (if set and non-empty)
 * 2. reqHost IF it is an actual domain name (not an IPv4 address and not localhost)
 * 3. Default: 'portal.wifi.local' (the static DNS entry in MikroTik)
 */
export function getMaskedPortalDomain(reqHost?: string | null): string {
  const envDns = process.env.HOTSPOT_DNS_NAME?.trim();
  if (envDns) {
    return envDns;
  }

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
 * Returns the full HTTP URL using the masked portal domain.
 * @param path Optional subpath, e.g. '/portal/planos' or '/portal/register'
 * @param reqHost Optional Host header from incoming request
 */
export function getMaskedPortalUrl(path: string = '', reqHost?: string | null): string {
  const domain = getMaskedPortalDomain(reqHost);
  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `http://${domain}${normalizedPath}`;
}
