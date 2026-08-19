const { RouterOSClient } = require('routeros-client');

async function main() {
  console.log('🚀 INICIANDO DIAGNÓSTICO DIRETO DO MIKROTIK (192.168.88.1)...');

  const connection = new RouterOSClient({
    host: '192.168.88.1',
    user: 'admin',
    password: '22101844',
    keepalive: true
  });

  try {
    const client = await connection.connect();
    console.log('✅ Conectado com sucesso ao RouterOS API!\n');

    // 1. Bridges
    console.log('=== [1] Bridges ===');
    try {
      const bridges = await client.menu('/interface/bridge').get();
      console.log(JSON.stringify(bridges.map(b => ({ id: b['.id'], name: b.name, disabled: b.disabled, comment: b.comment })), null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 2. Portas da Bridge
    console.log('=== [2] Bridge Ports ===');
    try {
      const ports = await client.menu('/interface/bridge/port').get();
      console.log(JSON.stringify(ports.map(p => ({ id: p['.id'], bridge: p.bridge, interface: p.interface, disabled: p.disabled })), null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 3. IP Addresses
    console.log('=== [3] IP Addresses ===');
    try {
      const ips = await client.menu('/ip/address').get();
      console.log(JSON.stringify(ips.map(ip => ({ id: ip['.id'], address: ip.address, network: ip.network, interface: ip.interface, disabled: ip.disabled })), null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 4. IP Pools
    console.log('=== [4] IP Pools ===');
    try {
      const pools = await client.menu('/ip/pool').get();
      console.log(JSON.stringify(pools.map(p => ({ id: p['.id'], name: p.name, ranges: p.ranges })), null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 5. DHCP Servers & Networks
    console.log('=== [5] DHCP Servers ===');
    try {
      const dhcps = await client.menu('/ip/dhcp-server').get();
      console.log(JSON.stringify(dhcps.map(d => ({ id: d['.id'], name: d.name, interface: d.interface, 'address-pool': d['address-pool'], disabled: d.disabled })), null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    console.log('=== [5b] DHCP Server Networks ===');
    try {
      const nets = await client.menu('/ip/dhcp-server/network').get();
      console.log(JSON.stringify(nets.map(n => ({ id: n['.id'], address: n.address, gateway: n.gateway, 'dns-server': n['dns-server'] })), null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 6. Hotspots
    console.log('=== [6] Hotspot Servers ===');
    try {
      const hs = await client.menu('/ip/hotspot').get();
      console.log(JSON.stringify(hs.map(h => ({ id: h['.id'], name: h.name, interface: h.interface, 'address-pool': h['address-pool'], profile: h.profile, disabled: h.disabled })), null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

    // 7. System Note
    console.log('=== [7] System Note ===');
    try {
      const notes = await client.menu('/system/note').get();
      console.log(JSON.stringify(notes, null, 2));
    } catch (e) {
      console.error(e.message);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    connection.close();
  }
}

main();
