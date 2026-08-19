const { RouterOSClient } = require('routeros-client');

async function main() {
  console.log('🚀 INICIANDO LIMPEZA EM 192.168.88.1...');

  const connection = new RouterOSClient({
    host: '192.168.88.1',
    user: 'admin',
    password: '22101844',
    keepalive: false
  });

  try {
    const client = await connection.connect();
    console.log('✅ Conectado ao RouterOS API em 192.168.88.1!');

    // 1. Desabilitar DHCP Server defconf (para não dar conflito com o dhcp_hotspot)
    console.log('\n--- [1] Removendo DHCP Server defconf ---');
    const dhcpMenu = client.menu('/ip/dhcp-server');
    const dhcps = await dhcpMenu.get();
    for (const dhcp of dhcps) {
      if (dhcp.name === 'defconf') {
        console.log(`Desabilitando/Removendo DHCP server legado: ${dhcp.name} (ID: ${dhcp['.id']})`);
        await dhcpMenu.remove(dhcp['.id']).catch(err => console.error('Erro ao remover dhcp:', err.message));
      }
    }

    // 2. Limpar redes DHCP extras
    console.log('\n--- [2] Limpando redes DHCP extras ---');
    const dhcpNetMenu = client.menu('/ip/dhcp-server/network');
    const nets = await dhcpNetMenu.get();
    for (const net of nets) {
      if (net.address !== '10.10.10.0/24') {
        console.log(`Removendo Rede DHCP extra: ${net.address} (ID: ${net['.id']})`);
        await dhcpNetMenu.remove(net['.id']).catch(err => console.error('Erro ao remover rede DHCP:', err.message));
      }
    }

    // 3. Limpar pools extras
    console.log('\n--- [3] Limpando pools extras ---');
    const poolMenu = client.menu('/ip/pool');
    const pools = await poolMenu.get();
    for (const pool of pools) {
      if (pool.name === 'default-dhcp') {
        console.log(`Removendo Pool legado: ${pool.name} (ID: ${pool['.id']})`);
        await poolMenu.remove(pool['.id']).catch(err => console.error('Erro ao remover pool:', err.message));
      }
    }

    // 4. Limpar endereços IP extras e desativar IP legado
    console.log('\n--- [4] Limpando endereços IP extras ---');
    const ipMenu = client.menu('/ip/address');
    const ips = await ipMenu.get();
    for (const ip of ips) {
      // Remover IPs extras na bridge-hotspot (tudo que for 10.10.x.1 diferente de 10.10.10.1)
      if (ip.interface === 'bridge-hotspot' && ip.address !== '10.10.10.1/24') {
        console.log(`Removendo IP extra de bridge-hotspot: ${ip.address} (ID: ${ip['.id']})`);
        await ipMenu.remove(ip['.id']).catch(err => console.error('Erro ao remover IP extra:', err.message));
      }
      // Remover IP 192.168.88.1 da interface bridge antiga
      if (ip.interface === 'bridge' && ip.address === '192.168.88.1/24') {
        console.log(`Removendo IP legado: ${ip.address} da interface ${ip.interface} (ID: ${ip['.id']})`);
        await ipMenu.remove(ip['.id']).catch(err => console.error('Erro ao remover IP legado:', err.message));
      }
    }

    // 5. Excluir a bridge "bridge" padrão
    console.log('\n--- [5] Removendo Bridge defconf (bridge) vazia ---');
    const bridgeMenu = client.menu('/interface/bridge');
    const bridges = await bridgeMenu.get();
    for (const b of bridges) {
      if (b.name === 'bridge') {
        console.log(`Removendo bridge legada: ${b.name} (ID: ${b['.id']})`);
        await bridgeMenu.remove(b['.id']).catch(err => console.error('Erro ao remover bridge legada:', err.message));
      }
    }

    // 6. Limpar scripts temporários
    console.log('\n--- [6] Limpando scripts temporários antigos ---');
    const scriptMenu = client.menu('/system/script');
    const scripts = await scriptMenu.get().catch(() => []);
    for (const s of scripts) {
      if (s.name === 'migrar_reboot') {
        console.log(`Removendo script temporário: ${s.name} (ID: ${s['.id']})`);
        await scriptMenu.remove(s['.id']).catch(err => console.error('Erro ao remover script:', err.message));
      }
    }

    console.log('\n✅ Limpeza completa concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
  } finally {
    connection.close();
  }
}

main();
