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

    console.log('\n=== System Scripts ===');
    const scripts = await client.menu('/system/script').get();
    console.log(JSON.stringify(scripts.map(s => ({
      name: s.name,
      runCount: s['run-count'],
      source: s.source,
      lastStarted: s['last-started']
    })), null, 2));

    console.log('\n=== Logs (last 20) ===');
    const logs = await client.menu('/log').get();
    const lastLogs = logs.slice(-20);
    lastLogs.forEach(l => {
      console.log(`[${l.time}] ${l.topics}: ${l.message}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    connection.close();
  }
}

main();
