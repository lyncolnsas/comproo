const { RouterOSClient } = require('routeros-client');

async function inspect() {
  const host = '192.168.88.1';
  const user = 'admin';
  const password = '22101844';

  console.log(`[1] Conectando ao MikroTik em ${host}...`);
  const conn = new RouterOSClient({
    host,
    port: 8728,
    user,
    password,
    timeout: 5000,
  });

  let client;
  try {
    client = await conn.connect();
    console.log('✅ Conexão via API RouterOS estabelecida com sucesso!');
  } catch (err) {
    console.error('❌ Falha ao conectar na API RouterOS:', err.message);
    process.exit(1);
  }

  try {
    // 1. Identity & Resource
    const identity = await client.menu('/system/identity').get();
    const resource = await client.menu('/system/resource').get();
    console.log('\n--- [IDENTIDADE & VERSÃO] ---');
    console.log('Identidade:', identity[0]?.name);
    console.log('RouterOS Versão:', resource[0]?.version);
    console.log('Arquitetura:', resource[0]?.['architecture-name']);
    console.log('Uptime:', resource[0]?.uptime);

    // 2. WireGuard Interfaces
    console.log('\n--- [INTERFACE WIREGUARD] ---');
    try {
      const wgInterfaces = await client.menu('/interface/wireguard').get();
      console.log('Interfaces WireGuard encontradas:', wgInterfaces);
    } catch (e) {
      console.log('Erro ao buscar /interface/wireguard (RouterOS v6 não suporta WireGuard):', e.message);
    }

    // 3. WireGuard Peers
    console.log('\n--- [PEERS WIREGUARD] ---');
    try {
      const peers = await client.menu('/interface/wireguard/peers').get();
      console.log('Peers WireGuard encontrados:', peers);
    } catch (e) {
      console.log('Erro ao buscar /interface/wireguard/peers:', e.message);
    }

    // 4. IP Addresses
    console.log('\n--- [ENDEREÇOS IP] ---');
    const ips = await client.menu('/ip/address').get();
    console.log('Endereços IP:', ips.map(i => ({ address: i.address, interface: i.interface, network: i.network })));

    // 5. IP Routes
    console.log('\n--- [ROTAS] ---');
    const routes = await client.menu('/ip/route').get();
    const vpnRoutes = routes.filter(r => (r['dst-address'] && r['dst-address'].includes('10.8.0')) || r.comment?.includes('MikroGestor'));
    console.log('Rotas relevantes:', vpnRoutes);

    // 6. Firewall Filter
    console.log('\n--- [FIREWALL FILTER MIKROGESTOR] ---');
    const fw = await client.menu('/ip/firewall/filter').get();
    const mgFw = fw.filter(f => f.comment?.includes('MikroGestor'));
    console.log('Regras de Firewall MikroGestor:', mgFw);

    // 7. Recent Logs
    console.log('\n--- [LOGS RECENTES (últimos 15)] ---');
    const logs = await client.menu('/log').get();
    logs.slice(-15).forEach(l => console.log(`[${l.time}] [${l.topics}] ${l.message}`));

  } catch (err) {
    console.error('Erro durante a inspeção:', err);
  } finally {
    conn.close();
  }
}

inspect();
