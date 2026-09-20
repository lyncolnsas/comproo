const fs = require('fs');
const file = 'src/app/dashboard/portal/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  'â¬†ï¸ ': '⬆️',
  'ðŸ›¡ï¸ ': '🛡️',
  'âš ï¸ ': '⚠️',
  'â„¹ï¸ ': 'ℹ️',
  'ðŸ‘ ï¸ ': '👁️'
};

let fixes = 0;
for (const [bad, good] of Object.entries(replacements)) {
  // Use simple split-join since these are strings
  const parts = content.split(bad);
  if (parts.length > 1) {
    content = parts.join(good);
    fixes += parts.length - 1;
    console.log(`Fixed ${parts.length - 1}x: ${bad} -> ${good}`);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log(`Total fixes: ${fixes}`);
