import { NextResponse } from 'next/server';
import { prisma, ensureVpnColumns } from '@/lib/prisma';

export async function GET() {
  try {
    await ensureVpnColumns();
    const routers = await prisma.router.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, routers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, host, user, password, port } = await request.json();

    if (!name || !host || !user || !password) {
      return NextResponse.json({ success: false, message: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const newRouter = await prisma.router.create({
      data: {
        name,
        host,
        user,
        password,
        port: port ? parseInt(port) : 8728,
        active: true
      }
    });

    return NextResponse.json({ success: true, message: 'Mikrotik adicionado com sucesso!', router: newRouter });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: 'ID não fornecido.' }, { status: 400 });

    await prisma.router.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Mikrotik removido com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
