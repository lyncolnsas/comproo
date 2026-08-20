const fs = require('fs');
const path = require('path');

const hotspotDir = path.join(__dirname, '..', 'hotspot');
const dirs = fs.readdirSync(hotspotDir);

let count = 0;

dirs.forEach(dir => {
  const loginPath = path.join(hotspotDir, dir, 'login.html');
  if (fs.existsSync(loginPath)) {
    let content = fs.readFileSync(loginPath, 'utf8');
    let original = content;

    // 1. Remove <div id="heading">...</div> (handles multi-line and nested tags)
    content = content.replace(/\s*<div\s+id=["']heading["'][^>]*>[\s\S]*?<\/div>\s*/gi, '\n');

    // 2. Remove <div id="iden">...</div>
    content = content.replace(/\s*<div\s+id=["']iden["'][^>]*>[\s\S]*?<\/div>\s*/gi, '\n');

    // 3. Remove CSS for #heading, #business-name, #iden from inline styles
    content = content.replace(/#heading\s*\{[^}]*\}\s*/gi, '');
    content = content.replace(/#business-name\s*\{[^}]*\}\s*/gi, '');
    content = content.replace(/#iden\s*\{[^}]*\}\s*/gi, '');
    content = content.replace(/#iden\s+img\s*\{[^}]*\}\s*/gi, '');

    // 4. Update #box margin if present
    content = content.replace(/(#box\s*\{[\s\S]*?margin:\s*)24px(\s+auto\s+0;)/gi, '$140px$2');

    if (content !== original) {
      fs.writeFileSync(loginPath, content, 'utf8');
      console.log(`[UPDATED] ${dir}/login.html`);
      count++;
    } else {
      console.log(`[NO CHANGE] ${dir}/login.html`);
    }
  }
});

console.log(`\nTotal updated templates: ${count}`);
