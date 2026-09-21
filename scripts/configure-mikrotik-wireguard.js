const { RouterOSClient } = require('routeros-client');

async function configureMikrotik() {
  const host = '192.168.88.1';
  const user = 'admin';
  const password = '22101844';
  const vpsPublicKey = 'UU8U6hPuCdAHoi+C+4swW/TGpnHqxvX6hGr9QJigJmU=';
  const vpsIp = '2.25.168.82';
  const vpsPort = 51820;
  const vpnIp = '10.8.0.2';
  const mikrotikPrivKey = 'dFQEAXAc44JBUZWTi+25LsWYQGzgXctZuqf3Nva9YiI=';

  console.log(`[1] Conectando ao MikroTik em ${host}...`);
  const conn = new RouterOSClient({
    host,
    port: 8728,
    user,
    password,
    timeout: 5000,
  });

  const client = await conn.connect();
  console.log('✅ Conectado com sucesso à API RouterOS!');

  try {
    // 1. Garantir interface WireGuard
    console.log('[2] Verificando interface WireGuard...');
    const wgInterfaces = await client.menu('/interface/wireguard').get();
    const existingWg = wgInterfaces.find(w => w.name === 'wg-mikrogestor');
    if (!existingWg) {
      console.log('  Criando interface wg-mikrogestor...');
      await client.menu('/interface/wireguard').add({
        name: 'wg-mikrogestor',
        'private-key': mikrotikPrivKey,
        'listen-port': 13231,
        comment: 'MikroGestor VPN - NAO MODIFICAR'
      });
      console.log('✅ Interface wg-mikrogestor criada!');
    } else {
      console.log('  Interface wg-mikrogestor já existe:', existingWg.id);
    }

    // 2. Limpar peers antigos
    console.log('[3] Verificando e limpando peers antigos...');
    const peers = await client.menu('/interface/wireguard/peers').get();
    for (const p of peers) {
      console.log(`  Removendo peer: ${p.id} (${p.comment || p['public-key']})`);
      await client.menu('/interface/wireguard/peers').remove(p.id);
    }

    // 3. Limpar IPs antigos na VPN
    console.log('[4] Verificando endereços IP...');
    const ips = await client.menu('/ip/address').get();
    for (const ip of ips) {
      if (ip.address.startsWith('10.8.0.') || ip.interface === '*A') {
        console.log(`  Removendo IP: ${ip.id} (${ip.address} em ${ip.interface})`);
        await client.menu('/ip/address').remove(ip.id);
      }
    }

    // 4. Garantir IP 10.8.0.2/24 na interface wg-mikrogestor
    console.log('[5] Adicionando IP 10.8.0.2/24 na interface wg-mikrogestor...');
    await client.menu('/ip/address').add({
      address: `${vpnIp}/24`,
      interface: 'wg-mikrogestor',
      network: '10.8.0.0',
      comment: 'MikroGestor VPN IP'
    });
    console.log('✅ IP 10.8.0.2/24 configurado!');

    // 5. Adicionar Peer da VPS
    console.log('[6] Adicionando peer da VPS MikroGestor...');
    await client.menu('/interface/wireguard/peers').add({
      interface: 'wg-mikrogestor',
      'public-key': vpsPublicKey,
      'endpoint-address': vpsIp,
      'endpoint-port': vpsPort,
      'allowed-address': '10.8.0.0/24',
      'persistent-keepalive': 25,
      comment: 'MikroGestor VPS'
    });
    console.log('✅ Peer adicionado com sucesso!');

    // 6. Verificar e garantir rota
    console.log('[7] Verificando rotas...');
    const routes = await client.menu('/ip/route').get();
    const hasRoute = routes.some(r => r['dst-address'] === '10.8.0.0/24');
    if (!hasRoute) {
      console.log('  Criando rota 10.8.0.0/24 via wg-mikrogestor...');
      await client.menu('/ip/route').add({
        'dst-address': '10.8.0.0/24',
        gateway: 'wg-mikrogestor',
        comment: 'MikroGestor VPN route'
      });
    }
    console.log('✅ Rota 10.8.0.0/24 garantida!');

    // 7. Configurar Firewall
    console.log('[8] Verificando regras de Firewall...');
    const fw = await client.menu('/ip/firewall/filter').get();
    const hasApiRule = fw.some(r => r.comment === 'MikroGestor: API access' && r.inInterface === 'wg-mikrogestor');
    if (!hasApiRule) {
      await client.menu('/ip/firewall/filter').add({
        chain: 'input',
        'in-interface': 'wg-mikrogestor',
        'src-address': '10.8.0.1',
        'dst-port': '8728,8729',
        protocol: 'tcp',
        action: 'accept',
        comment: 'MikroGestor: API access'
      });
      console.log('✅ Regra de firewall API access criada!');
    }

    // 8. Relatório de status final
    const finalWg = await client.menu('/interface/wireguard').get();
    const finalPeers = await client.menu('/interface/wireguard/peers').get();
    console.log('\n--- [STATUS FINAL WIREGUARD MIKROTIK] ---');
    console.log('Interfaces:', finalWg);
    console.log('Peers:', finalPeers);

  } catch (err) {
    console.error('❌ Erro na configuração do MikroTik:', err);
  } finally {
    conn.close();
    console.log('Conexão encerrada.');
  }
}

configureMikrotik();
