const { RouterOSClient } = require('routeros-client');

async function main() {
  console.log('🚀 TESTANDO CONEXÃO EM 10.10.10.1...');

  const connection = new RouterOSClient({
    host: '10.10.10.1',
    user: 'admin',
    password: '22101844',
    keepalive: true
  });

  try {
    const client = await connection.connect();
    console.log('✅ Conectado com sucesso ao RouterOS API em 10.10.10.1!\n');

    // 1. Bridges
    console.log('=== [1] Bridges ===');
    const bridges = await client.menu('/interface/bridge').get();
    console.log(JSON.stringify(bridges.map(b => ({ id: b['.id'], name: b.name, disabled: b.disabled, comment: b.comment })), null, 2));

    // 2. Portas da Bridge
    console.log('\n=== [2] Bridge Ports ===');
    const ports = await client.menu('/interface/bridge/port').get();
    console.log(JSON.stringify(ports.map(p => ({ id: p['.id'], bridge: p.bridge, interface: p.interface, disabled: p.disabled })), null, 2));

    // 3. IP Addresses
    console.log('\n=== [3] IP Addresses ===');
    const ips = await client.menu('/ip/address').get();
    console.log(JSON.stringify(ips.map(ip => ({ id: ip['.id'], address: ip.address, network: ip.network, interface: ip.interface, disabled: ip.disabled })), null, 2));

  } catch (error) {
    console.error('❌ Erro de conexão em 10.10.10.1:', error.message);
  } finally {
    connection.close();
  }
}

main();
