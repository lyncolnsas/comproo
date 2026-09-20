import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrawn = searchParams.get('includeDrawn') === 'true';

    const leads = await prisma.hotspotLead.findMany({
      where: includeDrawn ? {} : { drawnInRaffle: false },
      select: { 
        id: true, 
        name: true, 
        phone: true, 
        whatsappNumber: true,
        avatarUrl: true,
        hotspotUser: true,
        createdAt: true,
        drawnInRaffle: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
