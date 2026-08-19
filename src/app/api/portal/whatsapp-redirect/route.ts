import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mac = searchParams.get('mac') || '';

    let adminNumber = '5511999999999';

    // 1. Pegar o número do WhatsApp
    const activeInstances = await prisma.whatsappInstance.findMany({ where: { status: 'connected' } });
    
    if (activeInstances.length > 0) {
      const parts = activeInstances[0].number?.split(':');
      if (parts && parts[0]) {
        adminNumber = parts[0];
      }
    } else {
      const allInstances = await prisma.whatsappInstance.findMany();
      if (allInstances.length > 0) {
        const parts = allInstances[0].number?.split(':');
        if (parts && parts[0]) adminNumber = parts[0];
      } else {
        const waConfig = await prisma.systemConfig.findUnique({ where: { key: 'WHATSAPP_NUMBER' } });
        if (waConfig?.value) adminNumber = waConfig.value;
      }
    }

    const message = encodeURIComponent(`Olá! Quero comprar um voucher. Código: ${mac}`);
    const cleanNumber = adminNumber.replace(/\D/g, '');
    
    // O Captive Portal já foi vencido pelo Trial do MikroTik.
    // O Android Chrome vai abrir essa rota livremente, e daqui jogamos direto pro WhatsApp nativo.
    const redirectUrl = `https://wa.me/${cleanNumber}?text=${message}`;

    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('Erro no whatsapp-redirect:', error);
    return new NextResponse('Erro interno', { status: 500 });
  }
}
