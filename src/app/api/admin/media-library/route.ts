import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.mediaLibrary.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caption: true,
        mediaType: true,
        mimeType: true,
        thumbnailUrl: true,
        sourceJid: true,
        messageId: true,
        createdAt: true,
      }
    });
    return NextResponse.json({ success: true, items });
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
