import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/services/whatsapp';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const webhookTokenConfig = await prisma.systemConfig.findUnique({ where: { key: 'META_WHATSAPP_WEBHOOK_TOKEN' } });
  const verifyToken = webhookTokenConfig?.value || 'admin';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verification successful.');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.warn('[WhatsApp Webhook] Verification failed.', { mode, token, expected: verifyToken });
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object !== 'whatsapp_business_account') {
      return new NextResponse('Not Found', { status: 404 });
    }

    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const metadata = body.entry[0].changes[0].value.metadata;
      const remoteJid = message.from; 
      const phoneId = metadata?.phone_number_id || 'admin';

      if (message.type === 'text' && message.text) {
        const text = message.text.body;
        console.log(`[WhatsApp Webhook] Received message from ${remoteJid} to ${phoneId}: ${text}`);
        
        whatsappService.handleIncomingMessage(phoneId, remoteJid, text).catch(e => {
            console.error('[WhatsApp Webhook] Error processing message:', e);
        });
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error parsing request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
