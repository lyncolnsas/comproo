import { NextResponse } from 'next/server';
import { isVpsMode } from '@/lib/domain';

export async function POST(request: Request) {
  try {
    const isHttps =
      request.url.startsWith('https://') ||
      request.headers.get('x-forwarded-proto') === 'https' ||
      isVpsMode();

    const response = NextResponse.json({
      success: true,
      message: 'Sessão encerrada com sucesso.',
    });

    const expiredCookieOptions = {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax' as const,
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    };

    // Remove todos os cookies de sessão de forma segura via cabeçalhos HTTP Set-Cookie
    response.cookies.set('system_auth', '', expiredCookieOptions);
    response.cookies.set('mikro_session', '', expiredCookieOptions);
    response.cookies.set('portal_session', '', expiredCookieOptions);

    return response;

  } catch (error) {
    console.error('[AUTH LOGOUT ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao encerrar sessão.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Suporte a redirecionamento seguro caso acessado via link
  const postResponse = await POST(request);
  const redirectUrl = new URL('/', request.url);
  const redirectResponse = NextResponse.redirect(redirectUrl);

  // Copia os cookies expirados para a resposta de redirecionamento
  for (const cookie of postResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      ...cookie,
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    });
  }

  return redirectResponse;
}
