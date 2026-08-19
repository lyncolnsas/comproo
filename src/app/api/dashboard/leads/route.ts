export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { routerErrorResponse } from '@/lib/api-error';
import { MikrotikAPI } from '@/lib/routeros';

export async function GET() {
  try {
    const leads = await prisma.hotspotLead.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    let totalAge = 0;
    let ageCount = 0;
    
    // Age distribution groups
    const ageGroups = {
      'Menores de 18': 0,
      '18 a 25': 0,
      '26 a 35': 0,
      '36 a 50': 0,
      'Acima de 50': 0,
      'Não informado': 0
    };

    // Monthly signups (last 6 months)
    const monthlyStats: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      monthlyStats[label] = 0;
    }

    let todayCount = 0;
    const todayStr = now.toISOString().split('T')[0];

    leads.forEach(lead => {
      // Today check
      if (lead.createdAt.toISOString().split('T')[0] === todayStr) {
        todayCount++;
      }

      // Monthly check
      const leadMonth = lead.createdAt.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      if (monthlyStats[leadMonth] !== undefined) {
        monthlyStats[leadMonth]++;
      }

      // Age calculation
      if (lead.birthDate) {
        let age = now.getFullYear() - lead.birthDate.getFullYear();
        const m = now.getMonth() - lead.birthDate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < lead.birthDate.getDate())) {
          age--;
        }
        
        totalAge += age;
        ageCount++;

        if (age < 18) ageGroups['Menores de 18']++;
        else if (age <= 25) ageGroups['18 a 25']++;
        else if (age <= 35) ageGroups['26 a 35']++;
        else if (age <= 50) ageGroups['36 a 50']++;
        else ageGroups['Acima de 50']++;
      } else {
        ageGroups['Não informado']++;
      }
    });

    const avgAge = ageCount > 0 ? Math.round(totalAge / ageCount) : 0;

    // Formatting chart data
    const barChartData = Object.keys(monthlyStats).map(key => ({
      name: key,
      cadastros: monthlyStats[key]
    }));

    const donutChartData = Object.keys(ageGroups).map(key => ({
      name: key,
      value: ageGroups[key as keyof typeof ageGroups]
    })).filter(d => d.value > 0);

    return NextResponse.json({
      success: true,
      data: {
        total: leads.length,
        today: todayCount,
        averageAge: avgAge,
        barChart: barChartData,
        donutChart: donutChartData,
        recentLeads: leads.slice(0, 50), // Return top 50 for the table
        leads: leads // Return all leads for export
      }
    });

  } catch (error: any) {
    console.error('Leads Dashboard API Error:', error);
    return routerErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      await prisma.payment.deleteMany({});
      await prisma.hotspotLead.deleteMany({});
      return NextResponse.json({ success: true, message: 'Todos os leads foram excluídos com sucesso.' });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID do lead é obrigatório.' }, { status: 400 });
    }

    // 1. Find the lead first to get their hotspotUser name
    const lead = await prisma.hotspotLead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead não encontrado.' }, { status: 404 });
    }

    // 2. Try to delete the user from MikroTik Hotspot
    let mk;
    try {
      const activeRouter = await prisma.router.findFirst({ where: { active: true } });
      if (activeRouter) {
        mk = new MikrotikAPI();
        const connected = await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password, activeRouter.port);
        if (connected) {
          const existingUsers = (await mk.getHotspotUsers()) as Record<string, unknown>[];
          const found = existingUsers.find(u => String(u['name']) === String(lead.hotspotUser));
          const foundId = (found?.['id'] || found?.['.id']) as string | undefined;
          if (foundId) {
            await mk.removeHotspotUser(foundId);
          }
          mk.disconnect();
        }
      }
    } catch (mkErr) {
      if (mk) mk.disconnect();
      console.error('Failed to remove user from Mikrotik during lead delete:', mkErr);
    }

    // 3. Delete associated payments first to prevent foreign key errors
    await prisma.payment.deleteMany({ where: { leadId: id } });

    // 4. Delete from local database
    await prisma.hotspotLead.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Lead deletado com sucesso.' });
  } catch (error: any) {
    console.error('Leads Delete API Error:', error);
    return routerErrorResponse(error);
  }
}
