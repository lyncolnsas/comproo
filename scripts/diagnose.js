const { PrismaClient } = require('@prisma/client');
const { RouterOSClient } = require('routeros-client');

async function main() {
  console.log('🚀 INICIANDO DIAGNÓSTICO DO MIKROTIK HOTSPOT...\n');

  const prisma = new PrismaClient();
  const router = await prisma.router.findFirst({ where: { active: true } });

  if (!router) {
    console.error('❌ Nenhum roteador ativo encontrado no banco de dados.');
    process.exit(1);
  }

  console.log(`🔌 Conectando ao MikroTik: ${router.host} como ${router.user}...`);

  const connection = new RouterOSClient({
    host: router.host,
    user: router.user,
    password: router.password,
    keepalive: true
  });

  try {
    const client = await connection.connect();
    console.log('✅ Conectado com sucesso ao RouterOS API!\n');

    // 1. IPs Configurados
    console.log('--- [1/6] IP Addresses ---');
    try {
      const ips = await client.menu('/ip/address').get();
      console.log(JSON.stringify(ips, null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 2. Interfaces do Sistema
    console.log('--- [2/6] Interfaces ---');
    try {
      const ifaces = await client.menu('/interface').get();
      console.log(JSON.stringify(ifaces.map(i => ({ name: i.name, type: i.type, running: i.running, disabled: i.disabled })), null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 3. Portas da Bridge
    console.log('--- [3/6] Bridge Ports ---');
    try {
      const ports = await client.menu('/interface/bridge/port').get();
      console.log(JSON.stringify(ports, null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 4. DNS Settings
    console.log('--- [4/6] DNS Settings ---');
    try {
      const dns = await client.menu('/ip/dns').get();
      console.log('allowRemoteRequests:', dns[0]?.allowRemoteRequests);
      console.log('servers:', dns[0]?.servers);
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 5. DHCP Servers
    console.log('--- [5/6] DHCP Servers ---');
    try {
      const dhcps = await client.menu('/ip/dhcp-server').get();
      console.log(JSON.stringify(dhcps, null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 6. Hotspot Servers
    console.log('--- [6/6] Hotspot Servers ---');
    try {
      const hs = await client.menu('/ip/hotspot').get();
      console.log(JSON.stringify(hs, null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  } finally {
    connection.close();
    await prisma.$disconnect();
  }
}

main();
