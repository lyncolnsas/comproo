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

  // 2. Calcula métricas de vendas direto do banco SQLite local — Funciona 100% mesmo com MikroTik Offline!
  let todayIncome = 0;
  let monthIncome = 0;
  let todayCount = 0;
  let monthCount = 0;

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const todayVouchers = await prisma.voucher.findMany({
      where: {
        createdAt: {
          gte: startOfToday
        }
      }
    });

    const monthVouchers = await prisma.voucher.findMany({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    todayIncome = todayVouchers.reduce((acc, v) => acc + (v.price || 0), 0);
    monthIncome = monthVouchers.reduce((acc, v) => acc + (v.price || 0), 0);
    todayCount = todayVouchers.length;
    monthCount = monthVouchers.length;
  } catch (dbErr) {
    console.error('Erro ao buscar dados de vouchers do banco SQLite:', dbErr);
  }

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
      finance: {
        todayIncome,
        todayCount,
        monthIncome,
        monthCount
      },
      connectionError: connectionErrorMessage
    }
  });
}
