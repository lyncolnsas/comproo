import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { whatsapp } = await req.json();

    if (!whatsapp) {
      return NextResponse.json({ success: false, message: 'WhatsApp é obrigatório.' }, { status: 400 });
    }

    // format whatsapp (digits only)
    const formattedPhone = whatsapp.replace(/\D/g, '');

    // check if already in list and pending
    const existing = await prisma.waitingList.findFirst({
      where: {
        whatsapp: formattedPhone,
        status: 'pending',
      }
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Você já está na fila de espera!' });
    }

    await prisma.waitingList.create({
      data: {
        whatsapp: formattedPhone,
        status: 'pending',
      }
    });

    return NextResponse.json({ success: true, message: 'Adicionado à fila com sucesso! Avisaremos via WhatsApp.' });
  } catch (error: any) {
    console.error('[portal/waiting-list] Error:', error);
    return NextResponse.json({ success: false, message: 'Erro ao entrar na fila de espera.' }, { status: 500 });
  }
}
