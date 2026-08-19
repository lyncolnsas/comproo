import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { routerErrorResponse } from '@/lib/api-error';

export async function GET() {
  let mk;
  try {
    mk = await getMikrotikClient();
    
    // Fetch stats sequentially from Mikrotik to avoid socket collisions
    const identity = await mk.getIdentity();
    const resources = await mk.getSystemResources();
    const routerboard = await mk.getRouterboard();
    const clock = await mk.getSystemClock();
    const activeUsers = await mk.getHotspotActive();
    const allUsers = await mk.getHotspotUsers();
    const rawLogs = await mk.getLogs();

    let isProvisioned = false;
    try {
      isProvisioned = await mk.isProvisionedByMikroGestor();
    } catch {
      isProvisioned = false;
    }

    mk.disconnect();

    // Calculate sales stats from Prisma database (vouchers sold)
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

    const todayIncome = todayVouchers.reduce((acc, v) => acc + (v.price || 0), 0);
    const monthIncome = monthVouchers.reduce((acc, v) => acc + (v.price || 0), 0);
    const todayCount = todayVouchers.length;
    const monthCount = monthVouchers.length;

    // Format logs (last 15, newest first)
    const formattedLogs = rawLogs
      .slice(-15)
      .reverse()
      .map((l: any) => ({
        time: l.time || '',
        message: l.message || '',
        topics: l.topics || ''
      }));

    return NextResponse.json({
      success: true,
      data: {
        identity: identity[0]?.name || 'N/A',
        cpuLoad: parseInt(resources[0]?.['cpu-load'] || '0'),
        uptime: resources[0]?.uptime || 'N/A',
        boardName: resources[0]?.['board-name'] || 'N/A',
        version: resources[0]?.version || 'N/A',
        freeMemory: parseInt(resources[0]?.['free-memory'] || '0'),
        totalMemory: parseInt(resources[0]?.['total-memory'] || '0'),
        freeHdd: parseInt(resources[0]?.['free-hdd-space'] || '0'),
        totalHdd: parseInt(resources[0]?.['total-hdd-space'] || '0'),
        model: routerboard[0]?.model || 'N/A',
        isRouterboard: routerboard[0]?.routerboard === 'true' || routerboard[0]?.routerboard === true,
        clockTime: clock[0]?.time || 'N/A',
        clockDate: clock[0]?.date || 'N/A',
        clockTimeZone: clock[0]?.['time-zone-name'] || 'N/A',
        activeUsersCount: activeUsers.length || 0,
        totalUsersCount: allUsers.length || 0,
        isProvisioned,
        logs: formattedLogs,
        finance: {
          todayIncome,
          todayCount,
          monthIncome,
          monthCount
        }
      }
    });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}
