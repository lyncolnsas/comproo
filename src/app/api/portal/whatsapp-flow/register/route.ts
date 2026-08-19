import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';
import { whatsappService } from '@/services/whatsapp';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mac, phone } = body as { mac?: string; phone?: string };

    if (!mac || !phone) {
      return NextResponse.json({ error: 'MAC and Phone are required' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const activeRouter = await prisma.router.findFirst({ where: { active: true } });
    if (!activeRouter) {
      return NextResponse.json({ error: 'No active router' }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const mk = new MikrotikAPI();
    const connected = await mk.connect(
      activeRouter.host,
      activeRouter.user,
      activeRouter.password,
      activeRouter.port,
    );

    if (!connected) {
      return NextResponse.json({ error: 'Failed to connect to MikroTik' }, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      // 1. Remove IP Bindings antigos desse MAC
      const bindings = await mk.getHotspotIpBindings();
      for (const b of bindings) {
        if (b['mac-address'] === mac) {
          const id: string | undefined = b['.id'] ?? b.id;
          if (id) await mk.removeHotspotIpBinding(id);
        }
      }

      // 2. Remove sessões ativas do MAC
      await mk.removeHotspotActiveByMac(mac);

      // 3. Cria novo IP Binding (Bypassed) temporário
      const timestamp = Date.now();
      await mk.addHotspotIpBinding('0.0.0.0', 'bypassed', `temp-whatsapp-${timestamp}`, mac);
    } catch (e) {
      // Falha silenciosa: o fluxo WhatsApp ainda pode prosseguir
      console.warn('MikroTik IP binding error (non-fatal):', e);
    } finally {
      mk.disconnect();
    }

    // 4. Formata o JID do WhatsApp
    let formattedJid = phone.replace(/\D/g, '');
    if (!formattedJid.startsWith('55') && formattedJid.length <= 11) {
      formattedJid = `55${formattedJid}`;
    }
    if (!formattedJid.includes('@s.whatsapp.net')) {
      formattedJid = `${formattedJid}@s.whatsapp.net`;
    }

    // 5. Obtém instância WhatsApp conectada
    const activeInstances = await prisma.whatsappInstance.findMany({
      where: { status: 'connected' },
    });
    const instanceId = activeInstances.length > 0 ? activeInstances[0].id : 'admin';
    // O campo correto no schema Prisma é `number`, não `phone`
    const botPhoneRaw = activeInstances.length > 0 ? (activeInstances[0].number ?? '') : '';
    const botPhone = botPhoneRaw.replace(/\D/g, '');

    // 6. Dispara fluxo de registro em background
    setTimeout(async () => {
      try {
        await whatsappService.startRegistrationFlow(instanceId, formattedJid, mac);
      } catch (e) {
        console.error('Falha ao iniciar fluxo WhatsApp:', e);
      }
    }, 1000);

    return NextResponse.json({ success: true, botPhone }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: unknown) {
    console.error('Error starting WA flow:', error);
    return NextResponse.json({ error: 'Internal error' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
