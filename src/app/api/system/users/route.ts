import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth-crypto';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('system_auth')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Não autorizado.' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Sessão inválida.' }, { status: 401 });

    const currentUser = await prisma.user.findUnique({
      where: { username: payload.username },
      select: { id: true, username: true, name: true, role: true, createdAt: true }
    });

    const allUsers = await prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, createdAt: true }
    });

    return NextResponse.json({
      success: true,
      currentUser,
      users: allUsers
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao consultar usuários.' }, { status: 500 });
  }
}

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

    if (!body || typeof body.newPassword !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Dados incompletos fornecidos.' },
        { status: 400 }
      );
    }

    const cleanNewUsername = typeof body.newUsername === 'string' ? body.newUsername.trim() : '';
    const cleanNewPassword = body.newPassword.trim();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Informe a sua senha atual para confirmar a alteração de segurança.' },
        { status: 400 }
      );
    }

    if (cleanNewPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'A nova senha deve conter no mínimo 8 caracteres.' },
        { status: 400 }
      );
    }

    // Busca o usuário atualmente autenticado
    const currentUser = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Usuário autenticado não encontrado no banco.' },
        { status: 404 }
      );
    }

    // Confirma a senha atual do admin autenticado
    const { isValid } = verifyPassword(currentPassword, currentUser.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Senha atual incorreta.' },
        { status: 400 }
      );
    }

    // Prepara dados de atualização
    const updates: { username?: string; password?: string } = {
      password: hashPassword(cleanNewPassword)
    };

    if (cleanNewUsername && cleanNewUsername !== currentUser.username) {
      if (cleanNewUsername.length < 3) {
        return NextResponse.json(
          { success: false, message: 'O nome de usuário deve ter no mínimo 3 caracteres.' },
          { status: 400 }
        );
      }

      // Verifica se o novo username já existe em outra conta
      const collision = await prisma.user.findUnique({ where: { username: cleanNewUsername } });
      if (collision && collision.id !== currentUser.id) {
        return NextResponse.json(
          { success: false, message: `O nome de usuário '${cleanNewUsername}' já está em uso.` },
          { status: 409 }
        );
      }

      updates.username = cleanNewUsername;
    }

    // Atualiza a conta existente (RENOMEIA e ATUALIZA a senha)
    await prisma.user.update({
      where: { id: currentUser.id },
      data: updates,
    });

    // SEGURANÇA CRÍTICA: Se o usuário atual era 'admin' e mudou para outro nome,
    // ou se sobrou algum registro fantasma com username 'admin', remove-o categoricamente.
    if (updates.username && updates.username !== 'admin') {
      const deletedGhost = await prisma.user.deleteMany({
        where: {
          username: 'admin',
          id: { not: currentUser.id }
        }
      });
      if (deletedGhost.count > 0) {
        console.warn(`[SECURITY HARDENING] Conta legada 'admin' (${deletedGhost.count}) eliminada do banco de dados.`);
      }
    }

    console.log(`[USER MANAGEMENT] Conta id=${currentUser.id} atualizada para username='${updates.username || currentUser.username}' por '${payload.username}' (hash scrypt).`);

    const response = NextResponse.json({
      success: true,
      message: 'Credenciais atualizadas com sucesso! A sessão foi encerrada por segurança.',
      username: updates.username || currentUser.username
    });

    // Invalida a sessão para forçar novo login com as novas credenciais
    response.cookies.set('system_auth', '', { maxAge: 0, path: '/' });

    return response;
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
