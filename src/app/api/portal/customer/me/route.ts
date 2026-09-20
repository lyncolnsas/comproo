import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getMikrotikClient } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function getLeadIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('portal_session')?.value ?? null;
  } catch {
    return null;
  }
}

// Format MikroTik time strings (e.g. "1d2h3m") into readable formats
function parseMkTime(mkTime: string): string {
  if (!mkTime) return '0s';
  const daysMatch = mkTime.match(/(\d+)d/);
  const hoursMatch = mkTime.match(/(\d+)h/);
  const minsMatch = mkTime.match(/(\d+)m/);
  const secsMatch = mkTime.match(/(\d+)s/);
  
  const parts = [];
  if (daysMatch) parts.push(`${daysMatch[1]}d`);
  if (hoursMatch) parts.push(`${hoursMatch[1]}h`);
  if (minsMatch) parts.push(`${minsMatch[1]}m`);
  if (!daysMatch && !hoursMatch && !minsMatch && secsMatch) parts.push(`${secsMatch[1]}s`);
  
  return parts.join(' ') || mkTime;
}

export async function GET() {
  const leadId = await getLeadIdFromCookies();
  if (!leadId) {
    return NextResponse.json({ success: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const lead = await prisma.hotspotLead.findUnique({
    where: { id: leadId },
    include: {
      payments: {
        where: { isVoucher: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          amount: true,
          profile: true,
          voucherCode: true,
          isVoucher: true,
          giftTo: true,
          uptimeLimit: true,
          voucherActivatedAt: true,
          pixQrCodeBase64: true,
          pixPayload: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!lead) {
    const res = NextResponse.json({ success: false, message: 'Sessão inválida.' }, { status: 401 });
    res.cookies.delete('portal_session');
    return res;
  }

  // Obter uso do MikroTik
  let mkUsers: any[] = [];
  try {
    const mk = await getMikrotikClient();
    mkUsers = await mk.getHotspotUsers();
    mk.disconnect();
  } catch (err) {
    console.error('[customer/me] Erro ao buscar usuários no MikroTik:', err);
  }

  // Mapear uptime para os vouchers
  const vouchersComUso = lead.payments.map((p) => {
    const mkUser = mkUsers.find(u => u.name === p.voucherCode);
    const mkUptime = mkUser?.uptime || '0s';
    const mkLimit = mkUser?.['limit-uptime'] || p.uptimeLimit || 'Ilimitado';
    
    return {
      ...p,
      usage: {
        uptimeRaw: mkUptime,
        limitRaw: mkLimit,
        uptimeFormatted: parseMkTime(mkUptime),
        limitFormatted: mkLimit === 'Ilimitado' ? 'Ilimitado' : parseMkTime(mkLimit),
      }
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      id: lead.id,
      name: lead.name,
      hotspotUser: lead.hotspotUser,
      whatsappNumber: lead.whatsappNumber,
      vouchers: vouchersComUso,
    },
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('portal_session', '', { maxAge: 0, path: '/' });
  return response;
}
