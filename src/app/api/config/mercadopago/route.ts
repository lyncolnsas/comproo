import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const configMp = await prisma.systemConfig.findUnique({ where: { key: 'MERCADOPAGO_TOKEN' } });
    const configPix = await prisma.systemConfig.findUnique({ where: { key: 'MANUAL_PIX_KEY' } });
    
    return NextResponse.json({ 
      success: true, 
      token: configMp?.value ? '***' + configMp.value.slice(-4) : '',
      manualPixKey: configPix?.value || ''
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { token, manualPixKey } = await request.json();
    
    if (token !== undefined && !token.includes('***')) {
      await prisma.systemConfig.upsert({
        where: { key: 'MERCADOPAGO_TOKEN' },
        update: { value: token },
        create: { key: 'MERCADOPAGO_TOKEN', value: token }
      });
    }

    if (manualPixKey !== undefined) {
      await prisma.systemConfig.upsert({
        where: { key: 'MANUAL_PIX_KEY' },
        update: { value: manualPixKey },
        create: { key: 'MANUAL_PIX_KEY', value: manualPixKey }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
