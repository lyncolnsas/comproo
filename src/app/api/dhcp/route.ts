import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

export async function GET() {
  let mk;
  try {
    mk = await getMikrotikClient();
    const list = await mk.getDhcpLeases();
    mk.disconnect();

    const leases = list.map((item: any) => ({
      id: item.id,
      address: item.address || '',
      mac: item['mac-address'] || '',
      server: item.server || '',
      status: item.status || '',
      hostName: item['host-name'] || 'Unknown'
    }));

    return NextResponse.json({ success: true, data: leases });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}
