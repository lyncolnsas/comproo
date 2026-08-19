import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await prisma.hotspotLead.findMany({
      where: { drawnInRaffle: false },
      select: { id: true, name: true, phone: true, whatsappNumber: true },
    });
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
