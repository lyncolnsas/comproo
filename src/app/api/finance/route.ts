import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

// Helper to parse RouterOS date formats (e.g., 'may/22/2026' or '2026-05-22') into numbers
function parseRouterOsDate(dateStr: string): { day: number; month: number; year: number; formatted: string } {
  const monthsMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  let day = 1;
  let month = 1;
  let year = new Date().getFullYear();
  const normalized = dateStr.trim();

  if (normalized.includes('/')) {
    const parts = normalized.split('/');
    if (parts.length === 3) {
      // formats: 'may/22/2026' or '22/may/2026' or similar
      // Mikhmon typically saves date in 'may/22/2026' style or RouterOS system date format
      const isFirstMonth = isNaN(Number(parts[0]));
      if (isFirstMonth) {
        const monthAbbrev = parts[0].toLowerCase().substring(0, 3);
        month = parseInt(monthsMap[monthAbbrev] || '01', 10);
        day = parseInt(parts[1], 10);
      } else {
        day = parseInt(parts[0], 10);
        const monthAbbrev = parts[1].toLowerCase().substring(0, 3);
        month = parseInt(monthsMap[monthAbbrev] || '01', 10);
      }
      year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
    }
  } else if (normalized.includes('-')) {
    const parts = normalized.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // yyyy-mm-dd
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        // dd-mm-yyyy or mm-dd-yyyy (defaulting to dd-mm-yyyy)
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
      }
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    day,
    month,
    year,
    formatted: `${pad(day)}/${pad(month)}/${year}`
  };
}

const monthsPtBr: Record<number, string> = {
  1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril', 5: 'Maio', 6: 'Junho',
  7: 'Julho', 8: 'Agosto', 9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
};

export async function GET() {
  let mk;
  try {
    mk = await getMikrotikClient();
    
    // Fetch all scripts from MikroTik (sales are recorded as scripts in Mikhmon v3)
    const scripts = await mk.getSystemScripts();
    mk.disconnect();

    const transactions: any[] = [];
    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;

    const today = new Date();
    const tDay = today.getDate();
    const tMonth = today.getMonth() + 1;
    const tYear = today.getFullYear();

    const revenueByProfile: Record<string, { revenue: number; count: number }> = {};
    const revenueByMonth: Record<string, { label: string; revenue: number; count: number }> = {};

    scripts.forEach((script: any) => {
      // Only parse scripts with comment "mikhmon" or "mikrogestor"
      if (script.comment !== 'mikhmon' && script.comment !== 'mikrogestor') return;

      // Mikhmon script name format:
      // date-|-time-|-user-|-price-|-address-|-mac-|-validity-|-profile-|-comment
      const nameStr = script.name || '';
      const parts = nameStr.split('-|-');
      if (parts.length < 4) return;

      const dateStr = parts[0] || script.source || '';
      const timeStr = parts[1] || '';
      const username = parts[2] || '';
      const priceVal = parseFloat(parts[3]) || 0;
      const ip = parts[4] || '';
      const mac = parts[5] || '';
      const validity = parts[6] || '';
      const profile = parts[7] || 'default';
      const comment = parts[8] || '';

      const dateInfo = parseRouterOsDate(dateStr);

      // Financial aggregates
      totalRevenue += priceVal;

      if (dateInfo.day === tDay && dateInfo.month === tMonth && dateInfo.year === tYear) {
        todayRevenue += priceVal;
      }

      if (dateInfo.month === tMonth && dateInfo.year === tYear) {
        monthlyRevenue += priceVal;
      }

      // Grouping by Profile
      if (!revenueByProfile[profile]) {
        revenueByProfile[profile] = { revenue: 0, count: 0 };
      }
      revenueByProfile[profile].revenue += priceVal;
      revenueByProfile[profile].count += 1;

      // Grouping by Month (for charts and history selectors)
      const monthKey = `${dateInfo.year}-${String(dateInfo.month).padStart(2, '0')}`;
      const monthLabel = `${monthsPtBr[dateInfo.month] || 'Outro'} / ${dateInfo.year}`;
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { label: monthLabel, revenue: 0, count: 0 };
      }
      revenueByMonth[monthKey].revenue += priceVal;
      revenueByMonth[monthKey].count += 1;

      transactions.push({
        id: script.id || nameStr,
        date: dateStr,
        formattedDate: dateInfo.formatted,
        time: timeStr,
        username,
        price: priceVal,
        ip,
        mac,
        validity,
        profile,
        comment,
        owner: script.owner // e.g. "may2026"
      });
    });

    // Sort transactions chronologically (newest first)
    transactions.sort((a, b) => {
      const dateA = parseRouterOsDate(a.date);
      const dateB = parseRouterOsDate(b.date);
      
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);

      const valA = new Date(dateA.year, dateA.month - 1, dateA.day, timeA[0] || 0, timeA[1] || 0, timeA[2] || 0).getTime();
      const valB = new Date(dateB.year, dateB.month - 1, dateB.day, timeB[0] || 0, timeB[1] || 0, timeB[2] || 0).getTime();

      return valB - valA;
    });

    const profilesArray = Object.keys(revenueByProfile).map(k => ({
      name: k,
      revenue: revenueByProfile[k].revenue,
      count: revenueByProfile[k].count
    })).sort((a, b) => b.revenue - a.revenue);

    const monthsArray = Object.keys(revenueByMonth).map(k => ({
      key: k,
      owner: k.split('-')[1] + k.split('-')[0], // format match for deleting: e.g. "052026" -> need to match RouterOS owner like "may2026"
      label: revenueByMonth[k].label,
      revenue: revenueByMonth[k].revenue,
      count: revenueByMonth[k].count
    })).sort((a, b) => b.key.localeCompare(a.key));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        salesCount: transactions.length,
        transactions,
        profilesArray,
        monthsArray
      }
    });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  let mk;
  try {
    const { searchParams } = new URL(request.url);
    const monthFilter = searchParams.get('month'); // Expects format: e.g., "may2026"
    
    mk = await getMikrotikClient();
    const scripts = await mk.getSystemScripts();
    
    let count = 0;
    for (const s of scripts) {
      if (s.comment === 'mikhmon' || s.comment === 'mikrogestor') {
        // If owner filter is provided, check if it matches the script owner (e.g. "may2026")
        if (monthFilter && s.owner !== monthFilter) {
          continue;
        }
        await mk.removeSystemScript(s.id);
        count++;
      }
    }
    
    mk.disconnect();
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}
