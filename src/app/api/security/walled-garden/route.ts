import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

export async function GET() {
  let mk;
  try {
    mk = await getMikrotikClient();
    const list = await mk.getWalledGarden();
    mk.disconnect();

    const rules = list.map((item: any) => ({
      id: item.id,
      action: item.action,
      host: item['dst-host'] || item['src-address'] || 'N/A',
      comment: item.comment || ''
    }));

    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}

export async function POST(request: Request) {
  let mk;
  try {
    const { action, host, comment, mac } = await request.json();
    mk = await getMikrotikClient();
    
    // 1. Add Walled Garden rule (for domains)
    await mk.addWalledGarden(action, host, comment);

    // 2. Also add to Walled Garden IP List (for HTTPS 443 & direct IP bypass)
    try {
      const wgAction = action === 'allow' ? 'accept' : 'reject';
      await mk.addWalledGardenIp(wgAction, host, comment);
    } catch (wgIpErr) {
      console.warn('Failed to auto-create Walled Garden IP list entry:', wgIpErr);
    }

    // 3. If it's an IP address and allowed, also add Hotspot IP Binding (bypassed)
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
    if (isIp && action === 'allow') {
      try {
        const bindings = await mk.getHotspotIpBindings() as any[];
        const exists = bindings.some((b: any) => b.address === host);
        if (!exists) {
          await mk.addHotspotIpBinding(
            host, 
            'bypassed', 
            `Bypass Auto-Cadastro (${comment || 'API'})`, 
            mac || undefined
          );
        }
      } catch (bindErr) {
        console.warn('Failed to auto-create IP Binding whitelist:', bindErr);
      }
    }

    mk.disconnect();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let mk;
  try {
    const { id } = await request.json();
    mk = await getMikrotikClient();
    await mk.removeWalledGarden(id);
    mk.disconnect();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
