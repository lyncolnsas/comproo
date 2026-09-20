const fs = require('fs');
const path = require('path');

function processDir(dir) {
  if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git') || dir.includes('src')) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file === 'login.html') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('FALAR COM SUPORTE')) {
          content = content.replace(/<div id="wa-step-1">[\s\S]*?<\/div>\s*<div id="wa-step-2"/g, 
            `<div id="wa-step-1">
    <button type="button" onclick="document.getElementById('wa-step-1').style.display='none'; document.getElementById('wa-step-2').style.display='block';" style="width: 100%; background: #25D366; color: white; border: none; border-radius: 8px; padding: 14px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;">
      SOLICITAR ACESSO
    </button>
  </div>

  <div id="wa-step-2"`
          );
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Reverted UI in login.html:', fullPath);
      }
    }
  }
}
processDir(__dirname);
console.log('Done');
