const { RouterOSClient } = require('routeros-client');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const router = await prisma.router.findFirst({ where: { active: true } });
  if (!router) {
    console.error("No active router found");
    return;
  }
  
  console.log(`Connecting to: ${router.host} as ${router.user}...`);
  const connection = new RouterOSClient({
    host: router.host,
    user: router.user,
    password: router.password,
    port: router.port || 8728,
    keepalive: true
  });
  
  try {
    const client = await connection.connect();
    const rules = await client.menu('/ip/firewall/filter').get();
    
    console.log("\n--- FIREWALL FILTER RULES ---");
    console.log(JSON.stringify(rules.map(r => ({
      id: r['.id'],
      chain: r.chain,
      action: r.action,
      srcAddress: r['src-address'],
      dstAddress: r['dst-address'],
      outInterface: r['out-interface'],
      inInterface: r['in-interface'],
      disabled: r.disabled,
      comment: r.comment
    })), null, 2));
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    connection.close();
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
