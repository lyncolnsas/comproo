import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';

export const dynamic = 'force-dynamic';

/**
 * API Administrativa para Gerenciamento de Clientes Bloqueados (Blacklist).
 * Permite listar, bloquear manualmente ou desbloquear clientes.
 */

// Listar clientes bloqueados
export async function GET() {
  try {
    const list = await prisma.blockedClient.findMany({
      orderBy: { blockedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: list
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Erro ao listar blacklist' }, { status: 500 });
  }
}

// Bloquear manualmente um cliente (por MAC, CPF ou Telefone)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mac, cpf, phone, reason } = body;

    if (!mac && !cpf && !phone) {
      return NextResponse.json({
        success: false,
        message: 'Informe pelo menos um identificador: MAC, CPF ou Telefone.'
      }, { status: 400 });
    }

    const cleanMac = mac ? String(mac).trim().toUpperCase() : null;
    const cleanCpf = cpf ? String(cpf).replace(/\D/g, '') : null;
    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : null;
    const blockReason = reason ? String(reason).trim() : 'Bloqueio administrativo manual';

    // 1. Se informou MAC, aplica o bloqueio no MikroTik
    let mkSuccess = false;
    if (cleanMac) {
      try {
        const activeRouter = await prisma.router.findFirst({ where: { active: true } });
        if (activeRouter) {
          const mk = new MikrotikAPI();
          if (await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port)) {
            await mk.blockHotspotMac(cleanMac, blockReason);
            mk.disconnect();
            mkSuccess = true;
          }
        }
      } catch (mkErr) {
        console.warn('[Admin Blacklist] Aviso ao bloquear no MikroTik:', mkErr);
      }
    }

    // 2. Registra na tabela BlockedClient
    const blockedRecord = await prisma.blockedClient.create({
      data: {
        mac: cleanMac,
        cpf: cleanCpf,
        phone: cleanPhone,
        reason: blockReason,
        active: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cliente bloqueado com sucesso.',
      data: {
        ...blockedRecord,
        mkBlocked: mkSuccess
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Erro ao bloquear cliente' }, { status: 500 });
  }
}

// Desbloquear cliente (por ID ou MAC)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const mac = searchParams.get('mac');

    if (!id && !mac) {
      return NextResponse.json({
        success: false,
        message: 'Parâmetro "id" ou "mac" é obrigatório para desbloqueio.'
      }, { status: 400 });
    }

    let record = null;
    if (id) {
      record = await prisma.blockedClient.findUnique({ where: { id } });
    } else if (mac) {
      record = await prisma.blockedClient.findFirst({ where: { mac: mac.trim().toUpperCase() } });
    }

    const targetMac = record?.mac || (mac ? mac.trim().toUpperCase() : null);

    // 1. Remove bloqueio no MikroTik se houver MAC
    let mkRemoved = false;
    if (targetMac) {
      try {
        const activeRouter = await prisma.router.findFirst({ where: { active: true } });
        if (activeRouter) {
          const mk = new MikrotikAPI();
          if (await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port)) {
            mkRemoved = await mk.unblockHotspotMac(targetMac);
            mk.disconnect();
          }
        }
      } catch (mkErr) {
        console.warn('[Admin Blacklist] Aviso ao desbloquear no MikroTik:', mkErr);
      }
    }

    // 2. Remove ou desativa no banco de dados
    if (record) {
      await prisma.blockedClient.delete({ where: { id: record.id } });
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente desbloqueado com sucesso.',
      data: {
        mac: targetMac,
        mkUnblocked: mkRemoved
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Erro ao desbloquear cliente' }, { status: 500 });
  }
}
