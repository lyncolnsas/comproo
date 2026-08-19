const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const routers = await prisma.router.findMany();
    console.log('--- ROUTERS ---');
    console.log(routers);
    const leads = await prisma.hotspotLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log('--- RECENT LEADS ---');
    console.log(leads);
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
