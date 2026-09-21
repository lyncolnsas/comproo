import { NextResponse } from 'next/server';
import { MikrotikAPI } from '@/lib/routeros';
import { encryptData } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { ip, user, pass } = await request.json();

    // Se o IP informado pertencer a um roteador com VPN habilitada, conecta pelo IP da VPN (10.8.0.X)
    let targetIp = ip;
    try {
      const dbRouter = await prisma.router.findFirst({
        where: {
          OR: [{ host: ip }, { vpnIp: ip }]
        }
      });
      if (dbRouter?.vpnEnabled && dbRouter.vpnIp) {
        targetIp = dbRouter.vpnIp;
      }
    } catch {}

    const mk = new MikrotikAPI();
    const connected = await mk.connect(targetIp, user, pass);

    if (connected) {
      const identityRes = await mk.getIdentity();
      const identity = identityRes ? identityRes[0]?.name || 'MikroTik' : 'MikroTik';
      mk.disconnect();

      // Ensure this router is permanently saved in the database as the active one
      await prisma.$transaction(async (tx) => {
        // Mark all other routers as inactive
        await tx.router.updateMany({ data: { active: false } });
        
        // Upsert the current router
        const existingRouter = await tx.router.findFirst({
          where: {
            OR: [{ host: ip }, { vpnIp: ip }, { host: targetIp }]
          }
        });
        if (existingRouter) {
          await tx.router.update({
            where: { id: existingRouter.id },
            data: { user, password: pass, active: true, name: identity }
          });
        } else {
          await tx.router.create({
            data: { host: ip, user, password: pass, active: true, name: identity }
          });
        }
      });

      const jweToken = await encryptData({ ip, user, pass });
      
      const response = NextResponse.json({ success: true, identity });
      
      response.cookies.set({
        name: 'mikro_session',
        value: jweToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60, // 8 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials or host unreachable' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
