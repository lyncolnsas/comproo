import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MikrotikAPI } from '@/lib/routeros';
import { whatsappService } from '@/services/whatsapp';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    let body: any = {};
    try { body = await request.json(); } catch (e) {}
    
    const id = url.searchParams.get('data.id') || body?.data?.id;
    const action = body?.action || url.searchParams.get('action');

    // MP sometimes sends data in query parameters or in body
    if (action === 'payment.created' || action === 'payment.updated' || url.searchParams.get('type') === 'payment' || url.searchParams.get('topic') === 'payment') {
       if (!id) return NextResponse.json({ success: true });
       
       const payment = await prisma.payment.findUnique({
          where: { pixId: String(id) },
          include: { lead: true }
       });
       
       if (payment && payment.status !== 'approved') {
          
          // Verify with MercadoPago API if it's actually approved
          const config = await prisma.systemConfig.findUnique({ where: { key: 'MERCADOPAGO_TOKEN' } });
          if (config?.value) {
            const client = new MercadoPagoConfig({ accessToken: config.value });
            const mpPayment = new Payment(client);
            try {
              const paymentInfo = await mpPayment.get({ id: String(id) });
              
              if (paymentInfo.status === 'approved') {
                // Update DB
                await prisma.payment.update({
                   where: { id: payment.id },
                   data: { status: 'approved' }
                });
                
                // Liberar no MikroTik
                const activeRouter = await prisma.router.findFirst({ where: { active: true } });
                if (activeRouter) {
                   const mk = new MikrotikAPI();
                   const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
                   if (connected) {
                      const finalUsername = payment.lead.hotspotUser;
                      const finalPassword = payment.lead.password || payment.lead.hotspotUser;
                      
                      // 1. Remover a sessão ativa e o usuário temporário Trial (T-MAC)
                      if (payment.macAddress) {
                        try {
                          const trialUser = `T-${payment.macAddress}`;
                          await mk.removeHotspotActiveByUser(trialUser);
                          await mk.removeHotspotUserByName(trialUser);
                          console.log(`Trial do MAC: ${payment.macAddress} derrubado.`);
                        } catch(e) { console.error('Erro ao remover trial', e); }
                        
                        // 1.5. Remover o IP Binding Bypassed
                        try {
                            const bindings = await mk.getHotspotIpBindings() as any[];
                            for (const b of bindings) {
                                if (b['mac-address'] === payment.macAddress && b.type === 'bypassed') {
                                    await mk.removeHotspotIpBinding(b['.id'] || b.id);
                                }
                            }
                        } catch(e) { console.error('Erro ao remover binding', e); }
                      }

                      // 2. Criar o usuário oficial no MikroTik com o Profile Comprado
                      try {
                        const profileName = payment.profile || 'default';
                        
                        // Check if user already exists
                        const existingUsers = (await mk.getHotspotUsers()) as any[];
                        const found = existingUsers.find(u => String(u['name']) === String(finalUsername));
                        
                        if (found) {
                          const foundId = found['.id'] || found['id'];
                          await mk.updateHotspotUser(foundId, { profile: profileName, 'limit-uptime': 'none' });
                        } else {
                          await mk.addHotspotUser({
                            name: finalUsername,
                            password: finalPassword,
                            profile: profileName,
                            comment: `Venda WhatsApp PIX: ${payment.pixId}`,
                            server: 'all'
                          });
                        }
                      } catch(e) { console.error('Erro ao criar/atualizar usuário mk', e); }
                      
                      mk.disconnect();
                      
                      // Enviar WhatsApp Final
                      const contactPhone = payment.lead.phone || payment.lead.whatsappNumber;
                      if (contactPhone) {
                         const msg = `🎉 *Pagamento Confirmado!*\n\nSeu acesso à internet foi liberado sem interrupções.\n\n👤 *Usuário:* ${finalUsername}\n🔑 *Senha:* ${finalPassword}\n\nBom uso e obrigado pela preferência!`;
                         whatsappService.sendWhatsAppMessage('admin', contactPhone, msg);
                      }
                   }
                }
              }
            } catch (mpErr) {
              console.error('Error fetching payment from MP', mpErr);
            }
          }
       }
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
