/**
 * PATCH /api/auth/change-password
 * Permite ao admin logado alterar seu usuário e/ou senha.
 * Requer a senha atual para confirmar identidade.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth-crypto';
import { verifyJwt } from '@/lib/jwt';
import { cookies } from 'next/headers';

/** Verifica os requisitos mínimos de senha forte */
function validatePasswordStrength(password: string): string | null {
  if (password.length < 10) return 'A senha deve ter no mínimo 10 caracteres.';
  if (!/[A-Z]/.test(password)) return 'A senha deve conter ao menos uma letra maiúscula.';
  if (!/[0-9]/.test(password)) return 'A senha deve conter ao menos um número.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'A senha deve conter ao menos um símbolo especial (!@#$%...).';
  return null;
}

export async function PATCH(request: Request) {
  try {
    // Verifica autenticação via cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('system_auth')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Não autenticado.' },
        { status: 401 }
      );
    }

    const payload = await verifyJwt(token).catch(() => null);
    if (!payload || !payload.username) {
      return NextResponse.json(
        { success: false, message: 'Sessão inválida. Faça login novamente.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.currentPassword !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Senha atual é obrigatória.' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, newUsername } = body;

    // Busca o usuário atual
    const user = await prisma.user.findUnique({ where: { username: payload.username } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Verifica a senha atual
    const { isValid } = verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Senha atual incorreta.' },
        { status: 401 }
      );
    }

    const updates: { username?: string; password?: string } = {};

    // Validação e aplicação do novo usuário
    if (newUsername && typeof newUsername === 'string') {
      const cleanNew = newUsername.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      if (cleanNew.length < 4) {
        return NextResponse.json(
          { success: false, message: 'Usuário deve ter ao menos 4 caracteres (letras, números, . _ -).' },
          { status: 422 }
        );
      }
      if (cleanNew !== user.username) {
        // Verifica se o username já existe
        const exists = await prisma.user.findUnique({ where: { username: cleanNew } });
        if (exists) {
          return NextResponse.json(
            { success: false, message: 'Este nome de usuário já está em uso.' },
            { status: 409 }
          );
        }
        updates.username = cleanNew;
      }
    }

    // Validação e aplicação da nova senha
    if (newPassword && typeof newPassword === 'string') {
      const strengthError = validatePasswordStrength(newPassword);
      if (strengthError) {
        return NextResponse.json(
          { success: false, message: strengthError },
          { status: 422 }
        );
      }
      updates.password = hashPassword(newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nada a atualizar. Informe novo usuário e/ou nova senha.' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    const changedFields = [
      updates.username ? 'usuário' : null,
      updates.password ? 'senha' : null,
    ].filter(Boolean).join(' e ');

    console.log(`[SECURITY] ${changedFields} atualizado(s) para o usuário '${user.username}'.`);

    const response = NextResponse.json({
      success: true,
      message: `${changedFields.charAt(0).toUpperCase() + changedFields.slice(1)} atualizado(s) com sucesso. Faça login novamente.`,
      requiresRelogin: !!updates.username || !!updates.password,
    });

    // Se o usuário ou senha mudou, invalida a sessão atual (força relogin)
    response.cookies.set('system_auth', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('[CHANGE PASSWORD UNHANDLED ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno. Tente novamente.' },
      { status: 500 }
    );
  }
}
