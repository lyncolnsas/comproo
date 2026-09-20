const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const os = require('os');

async function testConnection() {
  const sessionDir = path.join(os.tmpdir(), `baileys_session_test`);
  console.log('Session Dir:', sessionDir);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'debug' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    console.log('Connection update:', update);
    if (update.connection === 'close') {
      console.log('Connection closed. Reason:', update.lastDisconnect?.error);
    }
  });
}

testConnection();
