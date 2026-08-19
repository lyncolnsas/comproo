import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const customText = url.searchParams.get('text') || 'Olá! Preciso de ajuda com o Wi-Fi.';

    const activeInstances = await prisma.whatsappInstance.findMany({
      where: {
        status: 'connected',
        number: { not: null }
      }
    });

    if (activeInstances.length === 0) {
      return NextResponse.json({ error: 'Nenhum bot do WhatsApp disponível no momento.' }, { status: 404 });
    }

    // Pick a random instance
    const randomIndex = Math.floor(Math.random() * activeInstances.length);
    const selectedInstance = activeInstances[randomIndex];
    
    // Format number to ensure it only has digits
    const phone = selectedInstance.number?.replace(/\D/g, '') || '';
    
    if (!phone) {
        return NextResponse.json({ error: 'Número de WhatsApp inválido no bot selecionado.' }, { status: 500 });
    }

    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(customText)}`;

    // HTTP 302 Redirect to WhatsApp
    return NextResponse.redirect(waLink);

  } catch (error: any) {
    console.error('Error redirecting to WhatsApp:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
