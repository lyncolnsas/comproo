import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('system_auth')?.value;
  if (!token) return false;
  const payload = await verifyJwt(token);
  return !!payload;
}

export async function GET() {
  try {
    const config = await prisma.systemConfig.findMany();
    const configMap = config.reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Auth only needed for POST for basic safety, but GET is fine to be public for portal use
    return NextResponse.json({ success: true, data: configMap });
  } catch (error) {
    console.error('[CONFIG GET ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Falha ao buscar configurações do sistema.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json(
      { success: false, message: 'Não autorizado.' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json().catch(() => null);
    if (!data || !data.key) {
      return NextResponse.json(
        { success: false, message: 'Parâmetro "key" é obrigatório.' },
        { status: 400 }
      );
    }

    const { key, value } = data;

    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    // Se a alteração for em free_wifi_mode, sincroniza automaticamente PORTAL_SALES_MODE
    if (key === 'free_wifi_mode') {
      const mode = value === 'true' ? 'free' : 'paid';
      await prisma.systemConfig.upsert({
        where: { key: 'PORTAL_SALES_MODE' },
        update: { value: mode },
        create: { key: 'PORTAL_SALES_MODE', value: mode },
      });
    }

    return NextResponse.json({ success: true, message: 'Configuração salva com sucesso.' });
  } catch (error) {
    console.error('[CONFIG UPDATE ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Falha ao atualizar configuração.' },
      { status: 500 }
    );
  }
}
