import { cookies } from 'next/headers';
import { MikrotikAPI } from './routeros';
import { decryptData, encryptData } from './jwt';
import { prisma } from './prisma';

export class MikrotikSessionError extends Error {
  constructor(
    message: string,
    public readonly code: 'NO_SESSION' | 'INVALID_SESSION' | 'CONNECTION_FAILED'
  ) {
    super(message);
    this.name = 'MikrotikSessionError';
  }
}

/** Returns raw credentials from cookie or active database router without establishing a connection */
export async function getSessionCredentials(): Promise<{ ip: string; user: string; pass: string }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('mikro_session');
  
  if (sessionCookie) {
    try {
      const decrypted = await decryptData(sessionCookie.value);
      if (decrypted?.ip && decrypted?.user) {
        return decrypted as { ip: string; user: string; pass: string };
      }
    } catch (err) {
      // Fallback to database if cookie decryption fails
    }
  }

  // Fallback to Database: find the active router (prefer VPN enabled)
  try {
    const activeRouter = await prisma.router.findFirst({
      where: {
        OR: [
          { active: true, vpnEnabled: true },
          { vpnEnabled: true, vpnIp: { not: null } },
          { active: true },
        ],
      },
      orderBy: [
        { vpnEnabled: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    if (activeRouter && (activeRouter.vpnIp || activeRouter.host) && activeRouter.user) {
      return {
        ip: activeRouter.vpnEnabled && activeRouter.vpnIp ? activeRouter.vpnIp : activeRouter.host,
        user: activeRouter.user,
        pass: activeRouter.password || ''
      };
    }
  } catch (err) {
    // Silently ignore DB errors and fall through to throw
  }

  throw new MikrotikSessionError('Sessão não encontrada e nenhum roteador ativo configurado.', 'NO_SESSION');
}

/** Connect to MikroTik — optionally override the IP (for reconnection to new IP) */
export async function getMikrotikClient(overrideIp?: string) {
  const credentials = await getSessionCredentials();

  if (overrideIp) {
    const mk = new MikrotikAPI();
    const connected = await mk.connect(overrideIp, credentials.user, credentials.pass);
    if (!connected) {
      throw new MikrotikSessionError(
        `Não foi possível conectar ao MikroTik em ${overrideIp}.`,
        'CONNECTION_FAILED'
      );
    }
    return mk;
  }

  // 1. Monta lista de roteadores candidatos a conexão
  const candidates: Array<{ id?: string; ip: string; user: string; pass: string }> = [];

  try {
    const routers = await prisma.router.findMany({
      where: {
        OR: [
          { vpnEnabled: true },
          { active: true },
        ],
      },
      orderBy: [
        { vpnEnabled: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    for (const r of routers) {
      const ip = (r.vpnEnabled && r.vpnIp) ? r.vpnIp : r.host;
      if (ip && !candidates.some(c => c.ip === ip)) {
        candidates.push({
          id: r.id,
          ip,
          user: r.user || credentials.user,
          pass: r.password !== null && r.password !== undefined && r.password !== '' ? r.password : credentials.pass,
        });
      }
    }
  } catch {}

  // Se o cookie tiver um IP diferente, adiciona como alternativa
  if (credentials.ip && !candidates.some(c => c.ip === credentials.ip)) {
    candidates.push({
      ip: credentials.ip,
      user: credentials.user,
      pass: credentials.pass,
    });
  }

  if (candidates.length === 0) {
    throw new MikrotikSessionError('Nenhum roteador configurado.', 'NO_SESSION');
  }

  // 2. Tenta conectar aos candidatos em sequência
  let lastError: Error | null = null;
  for (const cand of candidates) {
    const mk = new MikrotikAPI();
    try {
      const connected = await mk.connect(cand.ip, cand.user, cand.pass);
      if (connected) {
        // Promove o roteador que respondeu como ativo no banco
        if (cand.id) {
          prisma.router.update({
            where: { id: cand.id },
            data: { active: true, vpnStatus: 'connected', vpnLastSeen: new Date() },
          }).catch(() => {});
        }
        return mk;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new MikrotikSessionError(
    `Não foi possível conectar ao MikroTik (${candidates.map(c => c.ip).join(', ')}). ${lastError?.message || ''}`,
    'CONNECTION_FAILED'
  );
}


/** Update the session cookie with a new IP after provisioning changes the router IP */
export async function updateSessionIp(newIp: string): Promise<void> {
  const cookieStore = await cookies();
  const creds = await getSessionCredentials();
  const newToken = await encryptData({ ...creds, ip: newIp });
  cookieStore.set('mikro_session', newToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}
