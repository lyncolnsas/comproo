const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'node_modules', 'node-routeros', 'dist', 'Channel.js');

try {
  if (fs.existsSync(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    if (!content.includes("reply === '!empty'")) {
      content = content.replace(
        'switch (reply) {',
        "if (reply === '!empty') { this.data = []; return; }\n        switch (reply) {"
      );
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log('✅ [MikroGestor] Patch RouterOS v7 aplicado com sucesso em node-routeros/dist/Channel.js');
    } else {
      console.log('ℹ️ [MikroGestor] node-routeros Channel.js já está com o patch RouterOS v7.');
    }
  } else {
    console.log('ℹ️ [MikroGestor] node-routeros ainda não instalado; o patch em runtime cuidará disso.');
  }
} catch (err) {
  console.warn('⚠️ [MikroGestor] Não foi possível aplicar patch em Channel.js via script:', err.message);
}
