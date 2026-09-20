import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Dados inválidos fornecidos.' },
        { status: 400 }
      );
    }

    const cleanUsername = body.username.trim();
    const cleanPassword = body.password.trim();

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { success: false, message: 'O nome de usuário deve ter no mínimo 3 caracteres.' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: 'A senha deve conter no mínimo 4 caracteres.' },
        { status: 400 }
      );
    }

    // Hash criptográfico seguro antes de persistir no SQLite
    const secureHashedPassword = hashPassword(cleanPassword);

    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { username: cleanUsername },
        data: { password: secureHashedPassword },
      });
      console.log(`[USER MANAGEMENT] Senha do usuário '${cleanUsername}' atualizada com sucesso (hash scrypt).`);
      return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso!' });
    } else {
      await prisma.user.create({
        data: {
          username: cleanUsername,
          password: secureHashedPassword,
          role: 'ADMIN',
        },
      });
      console.log(`[USER MANAGEMENT] Novo usuário '${cleanUsername}' criado com sucesso (hash scrypt).`);
      return NextResponse.json({ success: true, message: 'Novo usuário criado com sucesso!' });
    }
  } catch (error) {
    console.error('[USER MANAGEMENT ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno ao processar dados do usuário.',
      },
      { status: 500 }
    );
  }
}
