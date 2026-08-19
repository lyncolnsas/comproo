import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

export async function GET() {
  let mk;
  try {
    mk = await getMikrotikClient();
    const list = await mk.getTimeBlockRules();
    mk.disconnect();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}

export async function POST(request: Request) {
  let mk;
  try {
    const { startTime, endTime, days, comment } = await request.json();
    mk = await getMikrotikClient();
    await mk.setTimeBlockRule(startTime, endTime, days, comment);
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
    await mk.removeTimeBlockRule(id);
    mk.disconnect();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
