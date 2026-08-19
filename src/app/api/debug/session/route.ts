import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decryptData } from '@/lib/jwt';
import { MikrotikAPI } from '@/lib/routeros';

// Endpoint de diagnóstico para verificar a sessão MikroTik
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mikro_session');

    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        step: 'NO_COOKIE',
        message: 'Cookie mikro_session não encontrado. É necessário conectar ao MikroTik primeiro.',
        cookies: cookieStore.getAll().map(c => c.name) // lista os cookies presentes (sem valores)
      }, { status: 401 });
    }

    const decrypted = await decryptData(sessionCookie.value);

    if (!decrypted) {
      return NextResponse.json({
        success: false,
        step: 'DECRYPT_FAILED',
        message: 'Falha ao descriptografar o cookie de sessão. O JWT_SECRET pode ter mudado.'
      }, { status: 401 });
    }

    const { ip, user } = decrypted as { ip: string; user: string; pass: string };

    if (!ip || !user) {
      return NextResponse.json({
        success: false,
        step: 'INVALID_PAYLOAD',
        message: 'O cookie existe mas não contém IP ou usuário válidos.',
        payload: { ip, user }
      }, { status: 401 });
    }

    // Tenta conexão real
    const mk = new MikrotikAPI();
    const connected = await mk.connect(ip, user, decrypted.pass);

    if (!connected) {
      return NextResponse.json({
        success: false,
        step: 'CONNECTION_FAILED',
        message: `Não foi possível conectar ao MikroTik em ${ip} com usuário "${user}". Verifique a rede e as credenciais.`,
        target: `${ip} / ${user}`
      }, { status: 503 });
    }

    const identity = await mk.getIdentity();
    mk.disconnect();

    return NextResponse.json({
      success: true,
      step: 'OK',
      message: `Sessão válida e MikroTik acessível.`,
      router: identity[0]?.name || 'N/A',
      target: `${ip} / ${user}`
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      step: 'EXCEPTION',
      message: error.message
    }, { status: 500 });
  }
}
