import { MikrotikAPI } from '../../src/lib/routeros';
import { prisma } from '../../src/lib/prisma';

async function check() {
  const r = await prisma.router.findFirst();
  if (!r) return;
  const api = new MikrotikAPI();
  await api.connect(r.host, r.user, r.password, r.port);
  const diag = await api.checkHotspot();
  console.log('HOTSPOT DIAGNOSTIC:', diag);
  await api.close();
}
check();
