import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let mk;
  let identityName = 'MikroTik';
  let cpuLoad = 0;
  let uptime = 'Offline';
  let boardName = 'Roteador Remoto';
  let version = 'N/A';
  let freeMemory = 0;
  let totalMemory = 1;
  let freeHdd = 0;
  let totalHdd = 1;
  let model = 'Desconectado';
  let isRouterboard = false;
  let clockTime = '--:--';
  let clockDate = '--/--/----';
  let clockTimeZone = 'UTC';
  let activeUsersCount = 0;
  let totalUsersCount = 0;
  let isProvisioned = false;
  let formattedLogs: any[] = [];
  let rawActiveUsers: any[] = [];
  let isOffline = false;
  let connectionErrorMessage = '';
  let targetHost = '192.168.88.1';
  let vpnActive = false;

  // 1. Tenta comunicar com o MikroTik
  try {
    mk = await getMikrotikClient();
    
    // Consultas paralelas com Promise.all para máxima velocidade e tolerância a falhas individuais
    const [identity, resources, routerboard, clock, activeUsers, allUsers, rawLogs] = await Promise.all([
      mk.getIdentity().catch(() => [{ name: 'MikroTik' }]),
      mk.getSystemResources().catch(() => [{}]),
      mk.getRouterboard().catch(() => [{}]),
      mk.getSystemClock().catch(() => [{}]),
      mk.getHotspotActive().catch(() => []),
      mk.getHotspotUsers().catch(() => []),
      mk.getLogs().catch(() => []),
    ]);

    rawActiveUsers = Array.isArray(activeUsers) ? activeUsers : [];
    isProvisioned = false;

    const res = resources[0] || {};
    identityName = identity[0]?.name || 'MikroTik';
    cpuLoad = parseInt(res.cpuLoad ?? res['cpu-load'] ?? '0') || 0;
    uptime = res.uptime || 'N/A';
    boardName = res.boardName ?? res['board-name'] ?? 'N/A';
    version = res.version || 'N/A';
    freeMemory = parseInt(res.freeMemory ?? res['free-memory'] ?? '0') || 0;
    totalMemory = parseInt(res.totalMemory ?? res['total-memory'] ?? '1') || 1;
    freeHdd = parseInt(res.freeHddSpace ?? res['free-hdd-space'] ?? '0') || 0;
    totalHdd = parseInt(res.totalHddSpace ?? res['total-hdd-space'] ?? '1') || 1;

    const rb = routerboard[0] || {};
    model = rb.model || 'N/A';
    isRouterboard = rb.routerboard === 'true' || rb.routerboard === true;

    const clk = clock[0] || {};
    clockTime = clk.time || 'N/A';
    clockDate = clk.date || 'N/A';
    clockTimeZone = clk.timeZoneName ?? clk['time-zone-name'] ?? 'N/A';

    activeUsersCount = Array.isArray(activeUsers) ? activeUsers.length : 0;
    totalUsersCount = Array.isArray(allUsers) ? allUsers.length : 0;

    const logsArray = Array.isArray(rawLogs) ? rawLogs : [];
    formattedLogs = logsArray
      .slice(-15)
      .reverse()
      .map((l: any) => ({
        time: l.time || '',
        message: l.message || '',
        topics: l.topics || ''
      }));

    mk.disconnect();
  } catch (error: any) {
    if (mk) {
      try { mk.disconnect(); } catch {}
    }
    isOffline = true;
    connectionErrorMessage = error?.message || 'Não foi possível conectar ao MikroTik.';

    // Busca detalhes do roteador cadastrado no banco local
    try {
      const activeRouter = await prisma.router.findFirst({ where: { active: true } });
      if (activeRouter) {
        identityName = activeRouter.name || 'MikroTik';
        targetHost = activeRouter.vpnEnabled && activeRouter.vpnIp ? activeRouter.vpnIp : activeRouter.host;
        vpnActive = !!activeRouter.vpnEnabled;
      }
    } catch {}
  }

  // 2. Calcula métricas de vendas e gráficos direto do banco SQLite local — 100% dados reais!
  let todayIncome = 0;
  let monthIncome = 0;
  let todayCount = 0;
  let monthCount = 0;
  let totalVouchers = 0;
  let totalRevenue = 0;
  let chartData: { name: string; date: string; faturamento: number; vouchers: number }[] = [];
  let monthlySales: { name: string; vendas: number; revenue: number }[] = [];
  let profileDistribution: { name: string; count: number; percent: number }[] = [];
  let recentVouchers: any[] = [];
  let recentPayments: any[] = [];

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Totais gerais
    totalVouchers = await prisma.voucher.count();
    const allVouchers = await prisma.voucher.findMany({
      select: { price: true, createdAt: true, profile: true }
    });
    totalRevenue = allVouchers.reduce((acc, v) => acc + (v.price || 0), 0);

    const todayVouchers = allVouchers.filter(v => v.createdAt >= startOfToday);
    const monthVouchers = allVouchers.filter(v => v.createdAt >= startOfMonth);

    todayIncome = todayVouchers.reduce((acc, v) => acc + (v.price || 0), 0);
    monthIncome = monthVouchers.reduce((acc, v) => acc + (v.price || 0), 0);
    todayCount = todayVouchers.length;
    monthCount = monthVouchers.length;

    // 2.1 Gráfico dos últimos 7 dias (Seg - Dom) com dados reais
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const dayVouchers = allVouchers.filter(v => v.createdAt >= d && v.createdAt < nextD);
      const dayIncome = dayVouchers.reduce((acc, v) => acc + (v.price || 0), 0);
      chartData.push({
        name: dayNames[d.getDay()],
        date: d.toISOString().split('T')[0],
        faturamento: dayIncome,
        vouchers: dayVouchers.length
      });
    }

    // 2.2 Gráfico dos últimos 6 meses com dados reais
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const mVouchers = allVouchers.filter(v => v.createdAt >= mDate && v.createdAt < nextMDate);
      const mIncome = mVouchers.reduce((acc, v) => acc + (v.price || 0), 0);
      monthlySales.push({
        name: monthNames[mDate.getMonth()],
        vendas: mVouchers.length,
        revenue: mIncome
      });
    }

    // 2.3 Distribuição real por perfil de Hotspot
    const profileCounts: Record<string, number> = {};
    allVouchers.forEach(v => {
      const p = v.profile || 'default';
      profileCounts[p] = (profileCounts[p] || 0) + 1;
    });
    profileDistribution = Object.entries(profileCounts).map(([name, count]) => ({
      name,
      count,
      percent: totalVouchers > 0 ? Math.round((count / totalVouchers) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // 2.4 Vouchers recentes reais
    recentVouchers = await prisma.voucher.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 2.5 Pagamentos recentes reais
    recentPayments = await prisma.payment.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { lead: true }
    });
  } catch (dbErr) {
    console.error('Erro ao buscar dados reais do banco SQLite:', dbErr);
  }

  // Lista de usuários ativos reais conectados no MikroTik
  const activeHotspotList = Array.isArray(rawActiveUsers) ? rawActiveUsers.slice(0, 10).map((u: any) => ({
    user: u.user || 'Desconhecido',
    address: u.address || '',
    macAddress: u['mac-address'] || '',
    uptime: u.uptime || '',
    bytesIn: parseInt(u['bytes-in'] || '0', 10),
    bytesOut: parseInt(u['bytes-out'] || '0', 10),
  })) : [];

  return NextResponse.json({
    success: true,
    offline: isOffline,
    data: {
      identity: identityName,
      targetHost,
      vpnEnabled: vpnActive,
      cpuLoad,
      uptime,
      boardName,
      version,
      freeMemory,
      totalMemory,
      freeHdd,
      totalHdd,
      model,
      isRouterboard,
      clockTime,
      clockDate,
      clockTimeZone,
      activeUsersCount,
      totalUsersCount,
      isProvisioned,
      logs: formattedLogs,
      activeHotspotList,
      chartData,
      monthlySales,
      profileDistribution,
      recentVouchers,
      recentPayments,
      finance: {
        todayIncome,
        todayCount,
        monthIncome,
        monthCount,
        totalVouchers,
        totalRevenue
      },
      connectionError: connectionErrorMessage
    }
  });
}

