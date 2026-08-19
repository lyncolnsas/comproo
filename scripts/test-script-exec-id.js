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
    
    console.log('\n--- Tentando executar com number: *2 ---');
    try {
      const res = await scriptMenu.exec('run', { number: '*2' });
      console.log('Success with number: *2!', res);
    } catch (e) {
      console.error('Failed with number: *2:', e.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    connection.close();
  }
}

main();
