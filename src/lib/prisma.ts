import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient; _dbMigrated?: boolean };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Self-healing schema migration para SQLite.
 * Garante que novas colunas (como vpnIp, vpnEnabled) existam mesmo se
 * o container em produção não tiver executado prisma db push.
 */
if (!globalForPrisma._dbMigrated) {
  globalForPrisma._dbMigrated = true;
  (async () => {
    try {
      const columns: any = await prisma.$queryRawUnsafe(`PRAGMA table_info("Router");`);
      const colNames = Array.isArray(columns) ? columns.map((c: any) => c.name) : [];

      if (colNames.length > 0) {
        if (!colNames.includes('vpnEnabled')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Router" ADD COLUMN "vpnEnabled" BOOLEAN NOT NULL DEFAULT 0;`);
        }
        if (!colNames.includes('vpnIp')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Router" ADD COLUMN "vpnIp" TEXT;`);
        }
        if (!colNames.includes('vpnPublicKey')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Router" ADD COLUMN "vpnPublicKey" TEXT;`);
        }
        if (!colNames.includes('vpnPrivKey')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Router" ADD COLUMN "vpnPrivKey" TEXT;`);
        }
        if (!colNames.includes('vpnLastSeen')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Router" ADD COLUMN "vpnLastSeen" DATETIME;`);
        }
        if (!colNames.includes('vpnStatus')) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Router" ADD COLUMN "vpnStatus" TEXT NOT NULL DEFAULT 'disconnected';`);
        }
      }
    } catch (e) {
      console.warn('[Prisma Auto-Migration]', e);
    }
  })();
}
