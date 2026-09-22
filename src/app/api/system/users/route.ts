import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth-crypto';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    // 1. Validar autenticação do administrador solicitante
    const cookieStore = await cookies();
    const token = cookieStore.get('system_auth')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Dados inválidos fornecidos.' },
        { status: 400 }
      );
    }

    const cleanUsername = body.username.trim();
    const cleanPassword = body.password.trim();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { success: false, message: 'O nome de usuário deve ter no mínimo 3 caracteres.' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'A senha deve conter no mínimo 8 caracteres para garantir a segurança.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      // Se estiver alterando a senha de um usuário existente, exige a senha atual caso seja ele próprio
      // ou se não for um reset explicitamente autorizado por ADMIN
      if (currentPassword) {
        const { isValid } = verifyPassword(currentPassword, existingUser.password);
        if (!isValid) {
          return NextResponse.json(
            { success: false, message: 'Senha atual incorreta.' },
            { status: 400 }
          );
        }
      } else if (payload.username === existingUser.username) {
        return NextResponse.json(
          { success: false, message: 'Para alterar sua própria senha, informe a senha atual.' },
          { status: 400 }
        );
      }

      // Hash criptográfico seguro antes de persistir no SQLite
      const secureHashedPassword = hashPassword(cleanPassword);

      await prisma.user.update({
        where: { username: cleanUsername },
        data: { password: secureHashedPassword },
      });
      console.log(`[USER MANAGEMENT] Senha do usuário '${cleanUsername}' atualizada por '${payload.username}' (hash scrypt).`);
      return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso!' });
    } else {
      // Criar novo usuário
      const secureHashedPassword = hashPassword(cleanPassword);
      await prisma.user.create({
        data: {
          username: cleanUsername,
          password: secureHashedPassword,
          role: 'ADMIN',
        },
      });
      console.log(`[USER MANAGEMENT] Novo usuário '${cleanUsername}' criado por '${payload.username}' (hash scrypt).`);
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

