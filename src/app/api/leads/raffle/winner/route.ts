import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/services/whatsapp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { leadId, message, sendMessage = false, markAsDrawn = true } = await req.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'O ID do lead é obrigatório' }, { status: 400 });
    }

    let lead = await prisma.hotspotLead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead não encontrado' }, { status: 404 });
    }

    if (markAsDrawn && !lead.drawnInRaffle) {
      lead = await prisma.hotspotLead.update({
        where: { id: leadId },
        data: { drawnInRaffle: true }
      });
    }

    const contactPhone = lead.whatsappNumber || lead.phone;

    // Tentar obter a foto do perfil via WhatsApp caso ainda não tenha avatar
    let freshAvatarUrl = lead.avatarUrl;
    if (!freshAvatarUrl && contactPhone) {
      try {
        freshAvatarUrl = await whatsappService.downloadAndSaveContactAvatar(lead.id, contactPhone);
        if (freshAvatarUrl) {
          lead = await prisma.hotspotLead.findUnique({ where: { id: leadId } }) || lead;
        }
      } catch (err) {
        console.warn('[Raffle] Não foi possível obter foto do WhatsApp:', err);
      }
    }

    let messageSent = false;
    let messageError = '';

    if (contactPhone && message && sendMessage) {
      try {
        const activeInstances = await prisma.whatsappInstance.findMany({ where: { status: 'connected' } });
        if (activeInstances.length > 0) {
          const instanceId = activeInstances[0].id;
          const msgText = message
            .replace(/\[Nome\]/g, lead.name || 'Cliente')
            .replace(/\[Telefone\]/g, contactPhone || '')
            .replace(/\[Usuario\]/g, lead.hotspotUser || '');

          let formattedPhone = contactPhone.replace(/\D/g, '');
          if (formattedPhone.length === 10 || formattedPhone.length === 11) {
            formattedPhone = `55${formattedPhone}`;
          }

          await whatsappService.sendWhatsAppMessage(instanceId, formattedPhone, msgText);
          messageSent = true;
        } else {
          messageError = 'Nenhuma instância do WhatsApp conectada no momento.';
        }
      } catch (waErr: any) {
        console.error('[Raffle] Erro ao disparar mensagem WhatsApp:', waErr);
        messageError = waErr?.message || 'Falha ao enviar mensagem via WhatsApp.';
      }
    }

    return NextResponse.json({ 
      success: true, 
      lead: {
        ...lead,
        avatarUrl: freshAvatarUrl || lead.avatarUrl
      }, 
      messageSent,
      messageError
    });
  } catch (error: any) {
    console.error('Erro no sorteio:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
