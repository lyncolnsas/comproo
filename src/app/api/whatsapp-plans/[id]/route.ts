import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Next.js 15: params is now a Promise
type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { title, profile, price, active, uptimeLimit } = await request.json();
    const cleanProfile = typeof profile === 'string' ? profile.trim() || 'default' : undefined;
    const plan = await (prisma.whatsappPlan as any).update({
      where: { id },
      data: { 
        title, 
        ...(cleanProfile ? { profile: cleanProfile } : {}), 
        price: Number(price), 
        active,
        ...(uptimeLimit !== undefined ? { uptimeLimit } : {})
      }
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    await prisma.whatsappPlan.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
