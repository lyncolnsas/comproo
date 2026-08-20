const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '1260516031758-hotspot');
if (fs.existsSync(targetDir)) {
  const dirs = fs.readdirSync(targetDir);
  dirs.forEach(dir => {
    const loginPath = path.join(targetDir, dir, 'login.html');
    if (fs.existsSync(loginPath)) {
      let content = fs.readFileSync(loginPath, 'utf8');
      content = content.replace(/\s*<div\s+id=["']heading["'][^>]*>[\s\S]*?<\/div>\s*/gi, '\n');
      content = content.replace(/\s*<div\s+id=["']iden["'][^>]*>[\s\S]*?<\/div>\s*/gi, '\n');
      content = content.replace(/#heading\s*\{[^}]*\}\s*/gi, '');
      content = content.replace(/#business-name\s*\{[^}]*\}\s*/gi, '');
      content = content.replace(/#iden\s*\{[^}]*\}\s*/gi, '');
      content = content.replace(/#iden\s+img\s*\{[^}]*\}\s*/gi, '');
      fs.writeFileSync(loginPath, content, 'utf8');
    }
  });
}
