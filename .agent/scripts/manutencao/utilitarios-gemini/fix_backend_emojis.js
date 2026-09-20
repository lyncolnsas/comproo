const fs = require('fs');

const file = 'src/app/api/hotspot/provision/route.ts';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '🌐': '[ REDE ]',
  '🌉': '[ BRIDGE ]',
  '🔓': '[ ACESSO ]',
  '📍': '[ IP ]',
  '🏊': '[ POOL ]',
  '⚙️': '[ CONFIG ]',
  '⚙': '[ CONFIG ]',
  '🛡️': '[ FIREWALL ]',
  '🛡': '[ FIREWALL ]',
  '📡': '[ HOTSPOT ]',
  '👤': '[ PERFIL ]',
  '🔀': '[ NAT ]',
  '✍️': '[ LOG ]',
  '✍': '[ LOG ]',
  '🔌': '[ CONEXÃO ]',
  '✅': '[ OK ]',
  '⚡': '[ RAPIDO ]',
  '🔄': '[ REINICIANDO ]',
  '✓': '[ OK ]'
};

for (const [emoji, text] of Object.entries(replacements)) {
  const regex = new RegExp(emoji, 'g');
  content = content.replace(regex, text);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed route.ts');
