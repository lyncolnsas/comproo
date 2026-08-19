import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Next.js 15: params is now a Promise
type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { title, profile, price, active } = await request.json();
    const plan = await prisma.whatsappPlan.update({
      where: { id },
      data: { title, profile, price: Number(price), active }
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
