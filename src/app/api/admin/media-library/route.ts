import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const instanceIdFilter = searchParams.get("instanceId");

    const whereClause: any = {};
    if (instanceIdFilter) {
      whereClause.instanceId = instanceIdFilter;
    }

    const [items, instances, globalGroup] = await Promise.all([
      prisma.mediaLibrary.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          caption: true,
          mediaType: true,
          mimeType: true,
          thumbnailUrl: true,
          sourceJid: true,
          messageId: true,
          instanceId: true,
          createdAt: true,
        }
      }),
      prisma.whatsappInstance.findMany({
        where: { engine: "baileys", libraryGroupJid: { not: null } },
        select: {
          id: true,
          name: true,
          number: true,
          libraryGroupJid: true,
          libraryGroupName: true,
          status: true,
        }
      }),
      prisma.systemConfig.findUnique({
        where: { key: "WHATSAPP_MEDIA_LIBRARY_GROUP" }
      }).then(r => r?.value || null)
    ]);

    return NextResponse.json({
      success: true,
      items,
      configuredGroups: instances.map(inst => ({
        instanceId: inst.id,
        instanceName: inst.name,
        number: inst.number,
        groupJid: inst.libraryGroupJid,
        groupName: inst.libraryGroupName || "Grupo Sem Nome",
        status: inst.status,
      })),
      globalGroupJid: globalGroup,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Erro ao listar biblioteca" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, caption } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: "ID obrigatorio" }, { status: 400 });
    const updated = await prisma.mediaLibrary.update({
      where: { id },
      data: { caption },
      select: { id: true, caption: true }
    });
    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: "ID obrigatorio" }, { status: 400 });
    await prisma.mediaLibrary.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Item removido da biblioteca." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Erro ao remover" }, { status: 500 });
  }
}
