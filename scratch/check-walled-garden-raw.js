const { RouterOSClient } = require('routeros-client');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const router = await prisma.router.findFirst({ where: { active: true } });
  if (!router) {
    console.error("No active router found in database");
    return;
  }
  
  console.log(`Connecting to MikroTik Router: ${router.host}:${router.port} as ${router.user}...`);
  const connection = new RouterOSClient({
    host: router.host,
    user: router.user,
    password: router.password,
    port: router.port || 8728,
    keepalive: true
  });
  
  try {
    const client = await connection.connect();
    
    const wg = await client.menu('/ip/hotspot/walled-garden').get();
    console.log("\n--- [1] /ip/hotspot/walled-garden (RAW) ---");
    console.log(JSON.stringify(wg, null, 2));
    
    const wgIp = await client.menu('/ip/hotspot/walled-garden/ip').get();
    console.log("\n--- [2] /ip/hotspot/walled-garden/ip (RAW) ---");
    console.log(JSON.stringify(wgIp, null, 2));
    
  } catch (err) {
    console.error("Error communicating with MikroTik RouterOS:", err.message);
  } finally {
    connection.close();
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
