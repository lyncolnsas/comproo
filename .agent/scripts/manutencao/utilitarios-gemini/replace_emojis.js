const fs = require('fs');

const file = 'src/app/dashboard/portal/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Lucide import
const importStatement = `import { Zap, Paintbrush, Key, CheckCircle2, X, VolumeX, Volume2, Palette, Users, User, ClipboardList, Megaphone, Upload, Save, Smartphone, Check, PartyPopper, Wrench, Lock, Package, Image as ImageIcon, Plug, Shield, AlertTriangle, Info, Trash, Plus } from 'lucide-react';\n`;

if (!content.includes('lucide-react')) {
  // Find last import
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
}

const replacements = [
  ['⚡', '<Zap className="w-4 h-4 inline-block mr-1" />'],
  ['🧹', '<Paintbrush className="w-4 h-4 inline-block mr-1" />'],
  ['🔑', '<Key className="w-4 h-4 inline-block mr-1" />'],
  ['✅', '<CheckCircle2 className="w-4 h-4 inline-block mr-1 text-green-500" />'],
  ['🔇', '<VolumeX className="w-4 h-4 inline-block mr-1" />'],
  ['🔊', '<Volume2 className="w-4 h-4 inline-block mr-1" />'],
  ['🎨', '<Palette className="w-4 h-4 inline-block mr-1" />'],
  ['👥', '<Users className="w-4 h-4 inline-block mr-1" />'],
  ['👤', '<User className="w-4 h-4 inline-block mr-1" />'],
  ['📋', '<ClipboardList className="w-4 h-4 inline-block mr-1" />'],
  ['📢', '<Megaphone className="w-4 h-4 inline-block mr-1" />'],
  ['⬆️', '<Upload className="w-4 h-4 inline-block mr-1" />'],
  ['💾', '<Save className="w-4 h-4 inline-block mr-1" />'],
  ['📱', '<Smartphone className="w-4 h-4 inline-block mr-1" />'],
  ['🎉', '<PartyPopper className="w-4 h-4 inline-block mr-1" />'],
  ['🔧', '<Wrench className="w-4 h-4 inline-block mr-1" />'],
  ['🔒', '<Lock className="w-4 h-4 inline-block mr-1" />'],
  ['📦', '<Package className="w-4 h-4 inline-block mr-1" />'],
  ['🌉', '<ImageIcon className="w-4 h-4 inline-block mr-1" />'],
  ['🔌', '<Plug className="w-4 h-4 inline-block mr-1" />'],
  ['🛡️', '<Shield className="w-4 h-4 inline-block mr-1" />'],
  ['⚠️', '<AlertTriangle className="w-4 h-4 inline-block mr-1 text-amber-500" />'],
  ['ℹ️', '<Info className="w-4 h-4 inline-block mr-1" />'],
  ['🗑️', '<Trash className="w-4 h-4 inline-block mr-1" />']
];

for (const [emoji, svg] of replacements) {
  // Be careful not to replace emojis inside literal JS strings if they are used in array mapping labels,
  // Actually, replacing in TSX JSX text is fine, but replacing inside `label: '⚡ Etapa 1'` will break if it's rendered as `{label}`.
  // Let's verify how they are rendered.
}

console.log("Not executing replacements globally to avoid breaking JS objects");
