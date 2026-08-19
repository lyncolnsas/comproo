const fs = require('fs');

const file = 'src/app/dashboard/portal/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import { Zap, Paintbrush, Key, CheckCircle2, X, VolumeX, Volume2, Palette, Users, User, ClipboardList, Megaphone, Upload, Save, Smartphone, Check, PartyPopper, Wrench, Lock, Package, Image as ImageIcon, Plug, Shield, AlertTriangle, Info, Trash, Plus, ArrowRight } from 'lucide-react';\n`;

if (!content.includes('import { Zap, Paintbrush')) {
  // Find last import
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
}

const emojiMap = {
  '✅': 'CheckCircle2',
  '✕': 'X',
  '🔇': 'VolumeX',
  '🔊': 'Volume2',
  '🎨': 'Palette',
  '👥': 'Users',
  '👤': 'User',
  '📋': 'ClipboardList',
  '📢': 'Megaphone',
  '⚡': 'Zap',
  '⬆': 'Upload',
  '🗑': 'Trash',
  '💾': 'Save',
  '📱': 'Smartphone',
  '✓': 'Check',
  '✗': 'X',
  '→': 'ArrowRight',
  '🎉': 'PartyPopper',
  '🔧': 'Wrench',
  '🔒': 'Lock',
  '📦': 'Package',
  '🌉': 'ImageIcon',
  '🔌': 'Plug',
  '🛡️': 'Shield',
  '⚠️': 'AlertTriangle',
  'ℹ️': 'Info'
};

// Very basic replacement for emojis in pure JSX text:
// Example: <span>✅</span> -> <span><CheckCircle2 className="w-4 h-4 inline-block mr-1" /></span>
for (const [emoji, icon] of Object.entries(emojiMap)) {
  const jsxRegex = new RegExp(`>([^<]*?)\\s*${emoji}\\s*([^<]*?)<`, 'g');
  content = content.replace(jsxRegex, (match, p1, p2) => {
    return `>${p1}<${icon} className="w-4 h-4 inline-block" />${p2}<`;
  });
}

// Replacement for emojis in string literals (e.g. inside `toast.success('✅ Texto')`)
// This is riskier so I'll only do it for toast messages.
for (const [emoji, icon] of Object.entries(emojiMap)) {
  const strRegex = new RegExp(`(['"])([^'"]*?)\\s*${emoji}\\s*([^'"]*?)(['"])`, 'g');
  content = content.replace(strRegex, (match, q1, p1, p2, q2) => {
    // Return JSX fragment instead of string
    return `<><${icon} className="w-4 h-4 inline-block" /> ${p1}${p2}</>`;
  });
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed page.tsx');
