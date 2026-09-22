import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoService } from '@/services/mercadopago';
import { cookies } from 'next/headers';
import { verifyCustomerJwt } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function getLeadId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portal_session')?.value;
    if (!token) return null;

    const payload = await verifyCustomerJwt(token);
    return payload?.leadId ?? null;
  } catch {
    return null;
  }
}


export async function POST(request: Request) {
  try {
    const leadId = await getLeadId();
    if (!leadId) {
      return NextResponse.json({ success: false, message: 'Não autenticado.' }, { status: 401 });
    }

    const lead = await prisma.hotspotLead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Sessão inválida.' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, forFriend, friendName, qty = 1 } = body;

    const voucherQty = Math.max(1, Math.min(10, parseInt(String(qty), 10)));

    if (!planId) {
      return NextResponse.json({ success: false, message: 'planId é obrigatório.' }, { status: 400 });
    }

    const plan = await prisma.whatsappPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) {
      return NextResponse.json({ success: false, message: 'Plano não encontrado ou inativo.' }, { status: 404 });
    }

    const sysConfig = await prisma.systemConfig.findMany();
    const configMap = sysConfig.reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const mpToken = configMap['mercadopago_access_token'];
    const isTestMode = !mpToken || mpToken.startsWith('TEST-') || mpToken === 'test';
    const isFreeWifiMode = configMap['free_wifi_mode'] === 'true';

    let pixId: string | null = null;
    let pixPayload: string | null = null;
    let pixQrCodeBase64: string | null = null;
    let isManualPix = false;

    if (isFreeWifiMode) {
       // Free mode bypasses PIX creation
       pixId = `FREE_${Date.now()}`;
       pixPayload = 'FREE_WIFI';
    } else if (!isTestMode && mpToken) {
      const mpService = await MercadoPagoService.init(mpToken);
      const payerEmail = lead.email || `${lead.hotspotUser}@wifi.local`;

      const mpResult = await mpService.createPixPayment({
        transaction_amount: plan.price * voucherQty,
        description: `${voucherQty}x Voucher ${plan.title}${forFriend && friendName ? ` para ${friendName}` : ''}`,
        payer: {
          email: payerEmail,
          first_name: lead.name || lead.hotspotUser,
        },
      });

      pixId = String(mpResult.id ?? '');
      pixPayload = mpResult.point_of_interaction?.transaction_data?.qr_code ?? null;
      pixQrCodeBase64 = mpResult.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;
    } else {
      // Check for Manual PIX Key fallback
      const manualPixKey = configMap['manual_pix_key'];
      if (manualPixKey) {
        const { generatePixPayload } = await import('@/lib/pix');
        pixId = `MANUAL_${Date.now()}`;
        pixPayload = generatePixPayload(manualPixKey, plan.price * voucherQty);
        pixQrCodeBase64 = null;
        isManualPix = true;
      } else {
        // Preview / test mode
        pixId = `PREVIEW_${Date.now()}`;
        pixPayload = '00020126580014br.gov.bcb.pix0136PREVIEW_KEY_FOR_TESTING52040000530398654' + `05${(plan.price * voucherQty).toFixed(2).replace('.', '')}5802BR5925MIKROGESTOR TEST6009SAO PAULO62070503***6304TEST`;
        pixQrCodeBase64 = null;
      }
    }

    const payments = [];
    let firstPaymentId = '';

    for (let i = 0; i < voucherQty; i++) {
      const voucherCode = generateVoucherCode();
      const pId = pixId; // Remove append for multiple quantities to group by pixId

      const payment = await prisma.payment.create({
        data: {
          leadId: lead.id,
          pixId: pId,
          pixPayload,
          pixQrCodeBase64,
          status: isFreeWifiMode ? 'approved' : 'pending',
          amount: isFreeWifiMode ? 0 : plan.price,
          profile: plan.profile,
          uptimeLimit: plan.uptimeLimit,
          voucherCode,
          isVoucher: true,
          giftTo: forFriend && friendName ? friendName : null,
        },
      });
      payments.push(payment);
      if (i === 0) firstPaymentId = payment.id;
    }

    // Auto provision se for GRÁTIS
    if (isFreeWifiMode) {
      const { MikrotikAPI } = await import('@/lib/routeros');
      const activeRouter = await prisma.router.findFirst({ where: { active: true } });
      if (activeRouter) {
        const mk = new MikrotikAPI();
        const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
        if (connected) {
           for (const pay of payments) {
              const username = pay.voucherCode || lead.hotspotUser;
              await mk.addHotspotUser({
                name: username,
                password: username, // voucher mode = user/pass are the same code
                profile: plan.profile,
                'limit-uptime': plan.uptimeLimit || 'none',
                comment: `Wi-Fi Gratis (Evento) | Lead: ${lead.hotspotUser}`,
                server: 'all'
              }).catch(() => {});
           }
           mk.disconnect();
        }
      }
    } else if (isManualPix) {
      // Se PIX manual, avisa no whatsapp do cliente que ele gerou N vouchers
      const contactPhone = lead.phone || lead.whatsappNumber;
      if (contactPhone) {
        const { whatsappService } = await import('@/services/whatsapp');
        let codesStr = payments.map((p, idx) => `🎟️ *Voucher ${idx+1}:*\nUsuário: ${p.voucherCode}\nSenha: ${p.voucherCode}`).join('\n\n');
        
        const msg = `⏳ *Pedido Recebido!*\n\nVocê solicitou ${voucherQty}x voucher(s) do plano *${plan.title}*.\n\nPara que seus vouchers sejam habilitados, realize o pagamento via PIX (Copia e Cola que você gerou na tela) e aguarde a aprovação do administrador.\n\n*Suas credenciais (ainda bloqueadas):*\n\n${codesStr}\n\nAssim que o pagamento for confirmado, você receberá um aviso e eles estarão prontos para uso.`;
        whatsappService.sendWhatsAppMessage('admin', contactPhone, msg);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: firstPaymentId,
        pixId: pixId,
        pixPayload: pixPayload,
        pixQrCodeBase64: pixQrCodeBase64,
        amount: isFreeWifiMode ? 0 : (plan.price * voucherQty),
        isManualPix,
        voucherCode: payments[0]?.voucherCode,
        plan: {
          title: plan.title,
          uptimeLimit: plan.uptimeLimit,
        },
        isTestMode,
        giftTo: friendName,
      },
    });
  } catch (error: any) {
    console.error('[portal/customer/buy-voucher] Error:', error);
    return NextResponse.json({ success: false, message: 'Erro ao criar voucher.' }, { status: 500 });
  }
}
