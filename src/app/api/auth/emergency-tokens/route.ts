/**
 * POST /api/auth/emergency-tokens/generate
 * Gera novos tokens de emergência e (se possível) envia uma cópia para o grupo de WhatsApp da mídia/backup
 * GET /api/auth/emergency-tokens/status
 * Retorna contagem de tokens disponíveis e usados
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/jwt';
import { generateEmergencyTokens, getEmergencyTokenStatus } from '@/lib/emergency-tokens';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('system_auth')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Sessão inválida' }, { status: 401 });

    const status = await getEmergencyTokenStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao consultar status dos tokens' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('system_auth')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Sessão inválida' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const sendToGroup = body.sendToGroup !== false;

    // Gera 8 tokens
    const rawTokens = await generateEmergencyTokens(8);

    let sentToGroup = false;
    let groupMessageError: string | null = null;

    if (sendToGroup) {
      try {
        const groupConfig = await prisma.systemConfig.findUnique({
          where: { key: 'libraryGroupJid' }
        });

        if (groupConfig?.value) {
          const mod = await import('@/services/whatsapp');
          const waSvc = mod.whatsappService;

          const tokensFormatted = rawTokens.map((t, idx) => `  ${idx + 1}. *${t}*`).join('\n');
          const message = 
            `🚨 *TOKENS DE SEGURANÇA OFFLINE — MikroGestor*\n\n` +
            `Estes são os seus códigos de acesso de emergência caso o servidor fique sem WhatsApp conectado ou sob ataque:\n\n` +
            `${tokensFormatted}\n\n` +
            `🔒 *Instruções:*\n` +
            `- Cada token pode ser usado *apenas uma vez*.\n` +
            `- Guarde esta mensagem ou tire print.\n` +
            `- Gerado em: ${new Date().toLocaleString('pt-BR')}\n` +
            `- Gerado por: *${payload.username}*`;

          await waSvc.sendWhatsAppMessage('admin', groupConfig.value, message);
          sentToGroup = true;
          console.log(`[EMERGENCY TOKENS] Códigos enviados com sucesso ao grupo ${groupConfig.value}`);
        } else {
          groupMessageError = 'Grupo do WhatsApp não configurado ainda nas configurações.';
        }
      } catch (err: any) {
        console.warn('[EMERGENCY TOKENS] Não foi possível enviar ao grupo WhatsApp:', err?.message || err);
        groupMessageError = err?.message || 'Falha no envio para o WhatsApp';
      }
    }

    return NextResponse.json({
      success: true,
      tokens: rawTokens,
      sentToGroup,
      groupMessageError,
      message: 'Tokens de emergência gerados com sucesso!'
    });
  } catch (error) {
    console.error('[EMERGENCY TOKENS GENERATE ERROR]', error);
    return NextResponse.json({ success: false, message: 'Erro ao gerar tokens de emergência' }, { status: 500 });
  }
}
