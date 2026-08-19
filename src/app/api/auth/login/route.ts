import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Fallback original para garantir que o usuário não fique trancado fora do sistema
    if (username === 'mikrogestor' && password === '1234') {
      const token = await signJwt({ username: 'mikrogestor', name: 'Admin Fallback' });
      
      const response = NextResponse.json({ success: true, name: 'Admin Fallback' });
      response.cookies.set('system_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60, // 8 hours
        path: '/',
      });
      return response;
    }

    // Verifica no Banco de Dados
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (user && user.password === password) {
      const token = await signJwt({ username: user.username, name: user.name || 'Admin' });
      
      const response = NextResponse.json({ success: true, name: user.name });
      response.cookies.set('system_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60, // 8 hours
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, message: 'Usuário ou senha incorretos.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro interno no Banco de Dados.' }, { status: 500 });
  }
}
