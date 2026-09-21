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
    
    // Sequencial para evitar colisões de socket no RouterOS
    const identity = await mk.getIdentity();
    const resources = await mk.getSystemResources();
    const routerboard = await mk.getRouterboard();
    const clock = await mk.getSystemClock();
    const activeUsers = await mk.getHotspotActive();
    const allUsers = await mk.getHotspotUsers();
    const rawLogs = await mk.getLogs();

    try {
      isProvisioned = await mk.isProvisionedByMikroGestor();
    } catch {
      isProvisioned = false;
    }

    identityName = identity[0]?.name || 'MikroTik';
    cpuLoad = parseInt(resources[0]?.['cpu-load'] || '0');
    uptime = resources[0]?.uptime || 'N/A';
    boardName = resources[0]?.['board-name'] || 'N/A';
    version = resources[0]?.version || 'N/A';
    freeMemory = parseInt(resources[0]?.['free-memory'] || '0');
    totalMemory = parseInt(resources[0]?.['total-memory'] || '0');
    freeHdd = parseInt(resources[0]?.['free-hdd-space'] || '0');
    totalHdd = parseInt(resources[0]?.['total-hdd-space'] || '0');
    model = routerboard[0]?.model || 'N/A';
    isRouterboard = routerboard[0]?.routerboard === 'true' || routerboard[0]?.routerboard === true;
    clockTime = clock[0]?.time || 'N/A';
    clockDate = clock[0]?.date || 'N/A';
    clockTimeZone = clock[0]?.['time-zone-name'] || 'N/A';
    activeUsersCount = activeUsers.length || 0;
    totalUsersCount = allUsers.length || 0;

    formattedLogs = rawLogs
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
