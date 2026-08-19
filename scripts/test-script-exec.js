const { RouterOSClient } = require('routeros-client');

async function main() {
  const connection = new RouterOSClient({
    host: '192.168.88.1',
    user: 'admin',
    password: '22101844',
    keepalive: true
  });

  try {
    const client = await connection.connect();
    console.log('✅ Conectado ao RouterOS API!');

    const scriptMenu = client.menu('/system/script');
    
    // Check if the script exists
    const scripts = await scriptMenu.get();
    const target = scripts.find(s => s.name === 'migrar_reboot');
    if (!target) {
      console.error('❌ Script migrar_reboot não encontrado!');
      return;
    }
    console.log('Found script:', target);

    // Try executing it with different parameter options
    console.log('\n--- Tentando executar com name ---');
    try {
      const res = await scriptMenu.exec('run', { name: 'migrar_reboot' });
      console.log('Success with name!', res);
    } catch (e) {
      console.error('Failed with name:', e.message);
    }

    console.log('\n--- Tentando executar com number ---');
    try {
      const res = await scriptMenu.exec('run', { number: 'migrar_reboot' });
      console.log('Success with number!', res);
    } catch (e) {
      console.error('Failed with number:', e.message);
    }

    console.log('\n--- Tentando executar com .id ---');
    try {
      const res = await scriptMenu.exec('run', { '.id': target['.id'] || target.id });
      console.log('Success with .id!', res);
    } catch (e) {
      console.error('Failed with .id:', e.message);
    }

    console.log('\n--- Tentando executar com id ---');
    try {
      const res = await scriptMenu.exec('run', { id: target['.id'] || target.id });
      console.log('Success with id!', res);
    } catch (e) {
      console.error('Failed with id:', e.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    connection.close();
  }
}

main();
