import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/services/whatsapp';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const instanceId = searchParams.get('instanceId');

    if (!instanceId) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro instanceId é obrigatório' },
        { status: 400 }
      );
    }

    const groups = await whatsappService.fetchInstanceGroups(instanceId);
    return NextResponse.json({ success: true, groups });
  } catch (err: any) {
    console.error('[GET /api/admin/whatsapp-groups]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao listar grupos do WhatsApp' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { instanceId, groupJid, groupName, applyToAll = false } = body;

    if (!instanceId || !groupJid) {
      return NextResponse.json(
        { success: false, error: 'instanceId e groupJid são obrigatórios' },
        { status: 400 }
      );
    }

    const cleanGroupName = (groupName || 'Grupo de Mídias').trim();

    if (applyToAll) {
      // 1. Atualiza todos os aparelhos Baileys
      await prisma.whatsappInstance.updateMany({
        where: { engine: 'baileys' },
        data: {
          libraryGroupJid: groupJid,
          libraryGroupName: cleanGroupName,
        }
      });

      // 2. Salva em SystemConfig para fallback global
      await prisma.systemConfig.upsert({
        where: { key: 'WHATSAPP_MEDIA_LIBRARY_GROUP' },
        update: { value: groupJid },
        create: { key: 'WHATSAPP_MEDIA_LIBRARY_GROUP', value: groupJid },
      });

      // 3. Atualiza instâncias ativas na memória
      const instances = await prisma.whatsappInstance.findMany({
        where: { engine: 'baileys' },
        select: { id: true }
      });
      for (const inst of instances) {
        whatsappService.setInstanceLibraryGroup(inst.id, groupJid, cleanGroupName);
      }

      return NextResponse.json({
        success: true,
        message: `Grupo "${cleanGroupName}" vinculado a todos os números com sucesso!`
      });
    }

    // Vincula apenas a este aparelho específico
    await prisma.whatsappInstance.update({
      where: { id: instanceId },
      data: {
        libraryGroupJid: groupJid,
        libraryGroupName: cleanGroupName,
      }
    });

    whatsappService.setInstanceLibraryGroup(instanceId, groupJid, cleanGroupName);

    return NextResponse.json({
      success: true,
      message: `Grupo "${cleanGroupName}" vinculado a este aparelho com sucesso!`
    });
  } catch (err: any) {
    console.error('[POST /api/admin/whatsapp-groups]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao vincular grupo' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const instanceId = searchParams.get('instanceId');

    if (!instanceId) {
      return NextResponse.json(
        { success: false, error: 'instanceId é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.whatsappInstance.update({
      where: { id: instanceId },
      data: {
        libraryGroupJid: null,
        libraryGroupName: null,
      }
    });

    whatsappService.setInstanceLibraryGroup(instanceId, null, null);

    return NextResponse.json({
      success: true,
      message: 'Vínculo do grupo removido com sucesso!'
    });
  } catch (err: any) {
    console.error('[DELETE /api/admin/whatsapp-groups]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao desvincular grupo' },
      { status: 500 }
    );
  }
}
