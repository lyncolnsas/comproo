import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/services/whatsapp';

export async function POST(req: Request) {
  try {
    const { leadId, message } = await req.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'O ID do lead é obrigatório' }, { status: 400 });
    }

    const lead = await prisma.hotspotLead.update({
      where: { id: leadId },
      data: { drawnInRaffle: true }
    });

    let messageSent = false;
    const contactPhone = lead.phone || lead.whatsappNumber;
    
    if (contactPhone && message) {
      const activeInstances = await prisma.whatsappInstance.findMany({ where: { status: 'connected' } });
      if (activeInstances.length > 0) {
        const instanceId = activeInstances[0].id;
        const msgText = message.replace(/\[Nome\]/g, lead.name || 'Cliente');
        
        // Ensure phone has country code
        let formattedPhone = contactPhone.replace(/\D/g, '');
        if (formattedPhone.length === 10 || formattedPhone.length === 11) {
          formattedPhone = `55${formattedPhone}`;
        }
        
        await whatsappService.sendWhatsAppMessage(instanceId, formattedPhone, msgText);
        messageSent = true;
      }
    }

    return NextResponse.json({ success: true, lead, messageSent });
  } catch (error: any) {
    console.error('Erro no sorteio:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
