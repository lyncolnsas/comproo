import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/services/whatsapp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (leadId) {
      const lead = await (prisma.hotspotLead as any).findUnique({ where: { id: leadId } });
      if (!lead) {
        return NextResponse.json({ success: false, message: 'Lead não encontrado.' }, { status: 404 });
      }

      const phone = lead.whatsappNumber || lead.phone;
      if (!phone) {
        return NextResponse.json({ success: false, message: 'Lead não possui número de WhatsApp informado.' }, { status: 400 });
      }

      const avatarUrl = await whatsappService.downloadAndSaveContactAvatar(lead.id, phone);
      return NextResponse.json({
        success: Boolean(avatarUrl),
        avatarUrl,
        message: avatarUrl ? 'Foto de perfil sincronizada com sucesso!' : 'Nenhuma foto pública disponível no WhatsApp para este número.'
      });
    }

    // Sync all pending leads
    const count = await whatsappService.syncPendingAvatars();
    return NextResponse.json({
      success: true,
      syncedCount: count,
      message: `${count} foto(s) de perfil baixada(s) com sucesso.`
    });
  } catch (error: any) {
    console.error('Avatar Sync API Error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Erro ao sincronizar avatares.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
