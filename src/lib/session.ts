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

  // Fallback to Database: find the active router
  try {
    const activeRouter = await prisma.router.findFirst({ where: { active: true } });
    if (activeRouter && activeRouter.host && activeRouter.user) {
      return {
        ip: activeRouter.host,
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

  // Se o roteador tem VPN habilitada, usa o IP VPN (10.8.0.X) em vez do host original.
  // Isso permite controle total de MikroTiks sem IP público.
  let targetIp = overrideIp || credentials.ip;

  if (!overrideIp) {
    try {
      const activeRouter = await prisma.router.findFirst({
        where: { active: true },
        select: { vpnEnabled: true, vpnIp: true, vpnStatus: true },
      });

      if (activeRouter?.vpnEnabled && activeRouter.vpnIp) {
        targetIp = activeRouter.vpnIp;
      }
    } catch {
      // Se o banco falhar, usa o IP das credenciais
    }
  }

  const mk = new MikrotikAPI();
  const connected = await mk.connect(targetIp, credentials.user, credentials.pass);

  if (!connected) {
    throw new MikrotikSessionError(
      `Não foi possível conectar ao MikroTik em ${targetIp}.`,
      'CONNECTION_FAILED'
    );
  }

  return mk;
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
