const { PrismaClient } = require('@prisma/client');
const { MikrotikAPI } = require('../src/lib/routeros');
const prisma = new PrismaClient();

async function main() {
  const activeRouter = await prisma.router.findFirst({ where: { active: true } });
  if (!activeRouter) return;
  const mk = new MikrotikAPI();
  await mk.connect(activeRouter.host, activeRouter.user, activeRouter.password);
  const wg = await mk.getWalledGarden();
  console.log("Walled Garden keys/values:", JSON.stringify(wg, null, 2));
  const wgIp = await mk.getWalledGardenIp();
  console.log("Walled Garden IP keys/values:", JSON.stringify(wgIp, null, 2));
  mk.disconnect();
}

main().catch(console.error).finally(() => prisma.$disconnect());
