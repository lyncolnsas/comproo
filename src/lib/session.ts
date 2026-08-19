import { cookies } from 'next/headers';
import { MikrotikAPI } from './routeros';
import { decryptData, encryptData } from './jwt';

export class MikrotikSessionError extends Error {
  constructor(
    message: string,
    public readonly code: 'NO_SESSION' | 'INVALID_SESSION' | 'CONNECTION_FAILED'
  ) {
    super(message);
    this.name = 'MikrotikSessionError';
  }
}

/** Returns raw credentials from cookie without establishing a connection */
export async function getSessionCredentials(): Promise<{ ip: string; user: string; pass: string }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('mikro_session');
  if (!sessionCookie) throw new MikrotikSessionError('Sessão não encontrada.', 'NO_SESSION');
  try {
    const decrypted = await decryptData(sessionCookie.value);
    if (!decrypted?.ip || !decrypted?.user) throw new MikrotikSessionError('Sessão inválida.', 'INVALID_SESSION');
    return decrypted as { ip: string; user: string; pass: string };
  } catch (err) {
    if (err instanceof MikrotikSessionError) throw err;
    throw new MikrotikSessionError('Falha ao ler sessão.', 'INVALID_SESSION');
  }
}

/** Connect to MikroTik — optionally override the IP (for reconnection to new IP) */
export async function getMikrotikClient(overrideIp?: string) {
  const credentials = await getSessionCredentials();
  const ip = overrideIp || credentials.ip;

  const mk = new MikrotikAPI();
  const connected = await mk.connect(ip, credentials.user, credentials.pass);

  if (!connected) {
    throw new MikrotikSessionError(
      `Não foi possível conectar ao MikroTik em ${ip}.`,
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}
