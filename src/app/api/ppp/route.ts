import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

export async function GET() {
  let mk;
  try {
    mk = await getMikrotikClient();
    const list = await mk.getPppSecrets();
    mk.disconnect();

    const secrets = list.map((item: any) => ({
      id: item.id,
      name: item.name || '',
      service: item.service || '',
      profile: item.profile || '',
      disabled: item.disabled === 'true'
    }));

    return NextResponse.json({ success: true, data: secrets });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}
