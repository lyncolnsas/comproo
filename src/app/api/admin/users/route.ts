import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password || username.length < 3 || password.length < 4) {
      return NextResponse.json({ success: false, message: 'Usuário e senha muito curtos.' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      // Update password
      await prisma.user.update({
        where: { username },
        data: { password }
      });
      return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso!' });
    } else {
      // Create new user
      await prisma.user.create({
        data: { username, password }
      });
      return NextResponse.json({ success: true, message: 'Novo usuário criado com sucesso!' });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
