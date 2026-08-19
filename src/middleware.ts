import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define rotas públicas
  const isPublicRoute = 
    path === '/' || 
    path.startsWith('/api/auth') || 
    path.startsWith('/portal/register') || 
    path.startsWith('/portal/verify') || 
    path.startsWith('/api/portal/') || 
    path.startsWith('/api/webhook') ||
    path.startsWith('/uploads/');
  
  const token = request.cookies.get('system_auth')?.value;
  
  // Se não estiver logado e tentar acessar rota protegida, redireciona
  if (!isPublicRoute && !token) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Valida o token se ele existir
  if (token) {
    const payload = await verifyJwt(token);
    
    // Se o token for inválido, limpa o cookie e redireciona/rejeita
    if (!payload) {
      if (path.startsWith('/api/')) {
        const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        response.cookies.delete('system_auth');
        return response;
      }
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('system_auth');
      return response;
    }
    
    // Se estiver logado e tentar acessar a página de login, manda pro dashboard
    if (path === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configura quais rotas o middleware deve rodar
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
