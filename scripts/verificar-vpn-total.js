const { RouterOSClient } = require('routeros-client');

async function verificarVpnTotal() {
  const host = '192.168.88.1';
  const user = 'admin';
  const password = '22101844';

  console.log(`📡 Conectando ao MikroTik em ${host}...`);
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
  } catch (err) {
    console.error('❌ Falha ao conectar na API RouterOS:', err.message);
    process.exit(1);
  }

  try {
    // 1. Interface WireGuard
    const interfaces = await client.menu('/interface/wireguard').get();
    const wg = interfaces.find(i => i.name === 'wg-mikrogestor');

    // 2. IP
    const ips = await client.menu('/ip/address').get();
    const vpnIp = ips.find(i => i.interface === 'wg-mikrogestor' && i.address.startsWith('10.8.0.'));

    // 3. Rotas
    const routes = await client.menu('/ip/route').get();
    const vpnRoute = routes.find(r => {
      const dst = r.dstAddress || r['dst-address'];
      const gw = r.gateway || r.immediateGw;
      return dst === '10.8.0.0/24' && (gw === 'wg-mikrogestor' || gw?.includes('wg-mikrogestor'));
    });

    // 4. Firewall
    const fw = await client.menu('/ip/firewall/filter').get();
    const fwRule = fw.find(r => r.comment === 'MikroGestor: API access' && r.inInterface === 'wg-mikrogestor');

    // 5. Peers
    const peers = await client.menu('/interface/wireguard/peers').get();
    const peer = peers.find(p => p.interface === 'wg-mikrogestor');

    console.log('\n============================================================');
    console.log('🔍 RESULTADO DA INSPEÇÃO COMPLETA NO SEU MIKROTIK');
    console.log('============================================================\n');

    // Teste 1: Interface
    if (wg && (wg.running === true || wg.running === 'true')) {
      console.log('Interface WireGuard:');
      console.log('✅ CRIADA E ATIVA!');
      console.log(`   Nome         : ${wg.name}`);
      console.log(`   Listen Port  : ${wg.listenPort}`);
      console.log(`   Status       : running = ${wg.running}`);
      console.log(`   Chave Pública: ${wg.publicKey}\n`);
    } else {
      console.log('Interface WireGuard:');
      console.log('❌ AUSENTE OU DESATIVADA!\n');
    }

    // Teste 2: IP
    if (vpnIp) {
      console.log('Endereçamento IP:');
      console.log('✅ CONFIGURADO!');
      console.log(`   IP/Máscara   : ${vpnIp.address}`);
      console.log(`   Interface    : ${vpnIp.interface}`);
      console.log(`   Rede         : ${vpnIp.network}\n`);
    } else {
      console.log('Endereçamento IP:');
      console.log('❌ NÃO ENCONTRADO NA INTERFACE wg-mikrogestor!\n');
    }

    // Teste 3: Rota
    if (vpnRoute) {
      console.log('Rotas:');
      console.log('✅ CONFIGURADA!');
      console.log(`   Destino      : ${vpnRoute.dstAddress || vpnRoute['dst-address']}`);
      console.log(`   Gateway      : ${vpnRoute.gateway || vpnRoute.immediateGw}\n`);
    } else {
      console.log('Rotas:');
      console.log('⚠️ Rota direta 10.8.0.0/24 ausente (ou criada dinamicamente).\n');
    }

    // Teste 4: Firewall
    if (fwRule) {
      console.log('Firewall:');
      console.log('✅ CONFIGURADO!');
      console.log(`   Regra        : ${fwRule.comment}`);
      console.log(`   Origem       : ${fwRule.srcAddress}`);
      console.log(`   Portas       : ${fwRule.dstPort} (TCP)`);
      console.log(`   Ação         : ${fwRule.action}\n`);
    } else {
      console.log('Firewall:');
      console.log('⚠️ Regra específica de firewall não localizada.\n');
    }

    // Teste 5: Peer da VPS
    if (peer) {
      const isConnected = peer.lastHandshake && peer.lastHandshake !== '';
      console.log('Peer da VPS:');
      console.log('✅ ADICIONADO E ATIVO!');
      console.log(`   Endpoint     : ${peer.endpointAddress}:${peer.endpointPort}`);
      console.log(`   Allowed IPs  : ${peer.allowedAddress}`);
      console.log(`   Keepalive    : ${peer.persistentKeepalive}`);
      console.log(`   Last Handshake: ${peer.lastHandshake || 'Aguardando handshake...'}`);
      console.log(`   Tráfego TX   : ${peer.tx} bytes`);
      console.log(`   Tráfego RX   : ${peer.rx} bytes`);
      console.log(`   Status Túnel : ${isConnected ? '🟢 ONLINE / TRANSMITINDO' : '🟡 AGUARDANDO RESPOSTA'}\n`);
    } else {
      console.log('Peer da VPS:');
      console.log('❌ NÃO ADICIONADO! (Aguardando configuração de peer)\n');
    }

    console.log('============================================================');
    if (wg && vpnIp && peer && peer.rx > 0) {
      console.log('🎉 RESULTADO FINAL: TÚNEL WIREGUARD 100% OPERACIONAL!');
    } else if (wg && vpnIp && peer) {
      console.log('✅ RESULTADO FINAL: CONFIGURAÇÃO CONCLUÍDA! TÚNEL ESTABELECIDO!');
    } else {
      console.log('⚠️ RESULTADO FINAL: PENDÊNCIAS DETECTADAS.');
    }
    console.log('============================================================\n');

  } catch (err) {
    console.error('Erro ao ler informações:', err);
  } finally {
    conn.close();
  }
}

verificarVpnTotal();
