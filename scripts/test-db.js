const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const info = await prisma.$queryRawUnsafe('PRAGMA table_info("Router");');
  console.log('Router columns in local DB:');
  console.log(info);
}

main().catch(console.error).finally(() => prisma.$disconnect());
