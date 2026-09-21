import { NextResponse } from 'next/server';
import { prisma, ensureVpnColumns } from '@/lib/prisma';

export async function GET() {
  try {
    await ensureVpnColumns();
    const columns: any = await prisma.$queryRawUnsafe(`PRAGMA table_info("Router");`);
    const colNames = Array.isArray(columns) ? columns.map((c: any) => c.name) : [];
    
    return NextResponse.json({
      success: true,
      message: 'Migração de colunas VPN verificada com sucesso.',
      columns: colNames,
      hasVpnIp: colNames.includes('vpnIp'),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
