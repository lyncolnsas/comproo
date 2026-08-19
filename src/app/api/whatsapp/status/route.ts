import { NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsapp';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const instances = await prisma.whatsappInstance.findMany();
    
    const results = instances.map(inst => {
      const status = whatsappService.getStatus(inst.id);
      const qr = whatsappService.getQrCode(inst.id);
      
      // Update DB status silently if it diverges
      if (status !== inst.status) {
        prisma.whatsappInstance.update({
          where: { id: inst.id },
          data: { status }
        }).catch(() => {});
      }

      return {
        id: inst.id,
        name: inst.name,
        number: inst.number,
        profilePicUrl: inst.profilePicUrl,
        status,
        qr
      };
    });

    return NextResponse.json({ success: true, instances: results });
  } catch (error) {
    return NextResponse.json({ success: false, status: 'error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, id, name } = await request.json();
    
    if (action === 'create') {
      const newInst = await prisma.whatsappInstance.create({
        data: { name: name || 'Novo WhatsApp', status: 'disconnected' }
      });
      return NextResponse.json({ success: true, instance: newInst });
    } else if (action === 'delete' && id) {
      whatsappService.logout(id);
      await prisma.whatsappInstance.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Deleted' });
    } else if (action === 'connect' && id) {
      whatsappService.connectWhatsApp(id);
      return NextResponse.json({ success: true, message: 'Connecting...' });
    } else if (action === 'logout' && id) {
      whatsappService.logout(id);
      return NextResponse.json({ success: true, message: 'Logged out.' });
    }
    return NextResponse.json({ success: false, message: 'Invalid action or missing id' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
