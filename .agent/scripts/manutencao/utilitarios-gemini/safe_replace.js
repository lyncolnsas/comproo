const fs = require('fs');

const file = 'src/app/dashboard/portal/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import { Zap, Paintbrush, Key, CheckCircle2, X, VolumeX, Volume2, Palette, Users, User, ClipboardList, Megaphone, Upload, Save, Smartphone, Check, PartyPopper, Wrench, Lock, Package, Image as ImageIcon, Plug, Shield, AlertTriangle, Info, Trash, Eye, ArrowRight } from 'lucide-react';\n`;

if (!content.includes('import { Zap, Paintbrush')) {
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
}

// 1. Exact string replacements for provSteps array
content = content.replace(/'⚡ Etapa 1: Provisionamento dos Serviços de Hotspot'/g, '<><Zap className="w-4 h-4 inline-block mr-1" /> Etapa 1: Provisionamento dos Serviços de Hotspot</>');
content = content.replace(/'🧹 Etapa 2: Validação de Configurações de Fábrica'/g, '<><Paintbrush className="w-4 h-4 inline-block mr-1" /> Etapa 2: Validação de Configurações de Fábrica</>');
content = content.replace(/'🛡️ Etapa 3: Validação de Regras de Firewall'/g, '<><Shield className="w-4 h-4 inline-block mr-1" /> Etapa 3: Validação de Regras de Firewall</>');
content = content.replace(/'🔑 Etapa 4: Configuração de Acesso à API e Assinatura'/g, '<><Key className="w-4 h-4 inline-block mr-1" /> Etapa 4: Configuração de Acesso à API e Assinatura</>');

// 2. Safe string replacements for toast messages & pure strings
content = content.replace(/'✅ Regra criada com sucesso! Atualizando...'/g, '<><CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Regra criada com sucesso! Atualizando...</>');
content = content.replace(/`❌ \${data\.message \|\| 'Erro ao criar regra\.'}`/g, '<><X className="w-4 h-4 inline-block mr-1" /> {data.message || "Erro ao criar regra."}</>');
content = content.replace(/'❌ Erro de conexão ao tentar corrigir a regra\.'/g, '<><X className="w-4 h-4 inline-block mr-1" /> Erro de conexão ao tentar corrigir a regra.</>');
content = content.replace(/`✅ Reconectado com sucesso em \${newIp}!`/g, '<><CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Reconectado com sucesso em {newIp}!</>');
content = content.replace(/'⚠️ Timeout de reconexão\. Verifique se o MikroTik está respondendo\.'/g, '<><AlertTriangle className="w-4 h-4 inline-block mr-1" /> Timeout de reconexão. Verifique se o MikroTik está respondendo.</>');

// 3. Simple text node / property replacements
const iconMap = {
  '👁️': 'Eye',
  '✕': 'X',
  '🔇': 'VolumeX',
  '🔊': 'Volume2',
  '🎨': 'Palette',
  '👥': 'Users',
  '⚙️': 'Wrench',
  '👤': 'User',
  '📋': 'ClipboardList',
  '📢': 'Megaphone',
  '⚡': 'Zap',
  '🗑️': 'Trash',
  '💾': 'Save',
  '📱': 'Smartphone',
  '🌍': 'Globe',
  '⚠️': 'AlertTriangle',
  '✅': 'CheckCircle2',
  '✓': 'Check',
  '✗': 'X',
  '→': 'ArrowRight',
  '🛡️': 'Shield',
  '🎉': 'PartyPopper',
  '🔧': 'Wrench',
  '🔒': 'Lock',
  '📦': 'Package',
  '🌉': 'ImageIcon',
  '🔌': 'Plug',
  '♂': 'Male', // text replacement below
  '♀': 'Female'
};

content = content.replace(/♂/g, 'Masc');
content = content.replace(/♀/g, 'Fem');
content = content.replace(/'✅ Provisionamento Completo'/g, '<><CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Provisionamento Completo</>');
content = content.replace(/'⚠️ Erro no Provisionamento'/g, '<><AlertTriangle className="w-4 h-4 inline-block mr-1" /> Erro no Provisionamento</>');

// Replace emojis explicitly inside JSX tags (e.g. <span>⚡</span> or >⚡<)
for (const [emoji, icon] of Object.entries(iconMap)) {
  const jsxRegex = new RegExp(`>([^<]*?)\\s*${emoji}\\s*([^<]*?)<`, 'g');
  content = content.replace(jsxRegex, (match, p1, p2) => {
    return `>${p1}<${icon} className="w-4 h-4 inline-block shrink-0" />${p2}<`;
  });
}

// Replace string literals remaining inside JS expressions (like the ternary for volume)
content = content.replace(/'🔇'/g, '<VolumeX className="w-4 h-4 inline-block" />');
content = content.replace(/'🔊'/g, '<Volume2 className="w-4 h-4 inline-block" />');
content = content.replace(/'✅'/g, '<CheckCircle2 className="w-4 h-4 inline-block text-emerald-500" />');
content = content.replace(/'⚠️'/g, '<AlertTriangle className="w-4 h-4 inline-block text-amber-500" />');
content = content.replace(/'🛡️'/g, '<Shield className="w-4 h-4 inline-block text-emerald-500" />');
content = content.replace(/'❌'/g, '<X className="w-4 h-4 inline-block text-red-500" />');

// Remove import Globe if not added
if (!content.includes('Globe')) {
  content = content.replace('Trash, Eye, ArrowRight }', 'Trash, Eye, ArrowRight, Globe }');
}

// Fix initialProvSteps type from string to ReactNode
content = content.replace(/label: string;/g, 'label: React.ReactNode;');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed page.tsx safely.');
