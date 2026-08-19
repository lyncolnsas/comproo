import { PrismaClient } from '@prisma/client';
import { MikrotikAPI } from './src/lib/routeros';

async function run() {
  const prisma = new PrismaClient();
  const router = await prisma.router.findFirst({where: {active: true}});
  if (!router) return;
  const mk = new MikrotikAPI();
  await mk.connect(router.host, router.user, router.password);
  const users = await mk.getHotspotUsers();
  console.log(users.filter((u: any) => u.name === '11999999999' || u.name === 'teste'));
  await mk.disconnect();
}

run();
