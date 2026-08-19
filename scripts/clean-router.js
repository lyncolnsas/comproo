const { RouterOSClient } = require('routeros-client');

async function main() {
  console.log('🚀 INICIANDO LIMPEZA EM 10.10.10.1...');

  const connection = new RouterOSClient({
    host: '10.10.10.1',
    user: 'admin',
    password: '22101844',
    keepalive: true
  });

  try {
    const client = await connection.connect();
    console.log('✅ Conectado ao RouterOS API em 10.10.10.1!');

    // 1. Limpar endereços IP extras na bridge-hotspot (manter APENAS 10.10.10.1/24)
    console.log('\n--- [1] Limpando endereços IP extras ---');
    const ipMenu = client.menu('/ip/address');
    const ips = await ipMenu.get();
    for (const ip of ips) {
      if (ip.interface === 'bridge-hotspot' && ip.address !== '10.10.10.1/24') {
        console.log(`Removendo IP extra: ${ip.address} da interface ${ip.interface} (ID: ${ip.id})`);
        if (ip.id) {
          await ipMenu.remove(ip.id).catch(err => console.error(`Erro ao remover IP ${ip.address}:`, err.message));
        }
      }
    }

    // 2. Limpar redes DHCP extras (manter apenas 10.10.10.0/24 e 192.168.88.0/24)
    console.log('\n--- [2] Limpando redes DHCP extras ---');
    const dhcpNetMenu = client.menu('/ip/dhcp-server/network');
    const nets = await dhcpNetMenu.get();
    for (const net of nets) {
      if (net.address !== '10.10.10.0/24' && net.address !== '192.168.88.0/24') {
        console.log(`Removendo Rede DHCP extra: ${net.address} (ID: ${net.id})`);
        if (net.id) {
          await dhcpNetMenu.remove(net.id).catch(err => console.error(`Erro ao remover rede ${net.address}:`, err.message));
        }
      }
    }

    // 3. Desabilitar DHCP Server defconf (para não dar conflito com o dhcp_hotspot)
    console.log('\n--- [3] Desabilitando DHCP Server defconf ---');
    const dhcpMenu = client.menu('/ip/dhcp-server');
    const dhcps = await dhcpMenu.get();
    for (const dhcp of dhcps) {
      if (dhcp.name === 'defconf') {
        console.log(`Desabilitando DHCP server legado: ${dhcp.name} (ID: ${dhcp.id})`);
        if (dhcp.id) {
          await dhcpMenu.where('.id', dhcp.id).update({ disabled: 'yes' }).catch(err => console.error('Erro ao desabilitar DHCP:', err.message));
        }
      }
    }

    // 4. Desabilitar IP 192.168.88.1/24 na bridge padrão
    console.log('\n--- [4] Desabilitando IP 192.168.88.1/24 na bridge defconf ---');
    for (const ip of ips) {
      if (ip.interface === 'bridge' && ip.address === '192.168.88.1/24') {
        console.log(`Desabilitando IP legado: ${ip.address} na interface ${ip.interface} (ID: ${ip.id})`);
        if (ip.id) {
          await ipMenu.where('.id', ip.id).update({ disabled: 'yes' }).catch(err => console.error('Erro ao desabilitar IP legado:', err.message));
        }
      }
    }

    // 5. Excluir a bridge "bridge" padrão
    console.log('\n--- [5] Removendo Bridge defconf (bridge) vazia ---');
    const bridgeMenu = client.menu('/interface/bridge');
    const bridges = await bridgeMenu.get();
    for (const b of bridges) {
      if (b.name === 'bridge') {
        console.log(`Removendo bridge legada vazia: ${b.name} (ID: ${b.id})`);
        if (b.id) {
          await bridgeMenu.remove(b.id).catch(err => console.error('Erro ao remover bridge legada:', err.message));
        }
      }
    }

    // 6. Limpar scripts temporários
    console.log('\n--- [6] Limpando scripts temporários antigos ---');
    const scriptMenu = client.menu('/system/script');
    const scripts = await scriptMenu.get().catch(() => []);
    for (const s of scripts) {
      if (s.name === 'migrar_reboot') {
        console.log(`Removendo script temporário: ${s.name} (ID: ${s.id})`);
        if (s.id) {
          await scriptMenu.remove(s.id).catch(err => console.error('Erro ao remover script:', err.message));
        }
      }
    }

    console.log('\n✅ Limpeza e migração concluídas com sucesso total!');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
  } finally {
    connection.close();
  }
}

main();
