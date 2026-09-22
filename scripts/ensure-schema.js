const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'schema.prisma');
const dest = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (fs.existsSync(src)) {
  try {
    const srcContent = fs.readFileSync(src, 'utf8');
    let needsCopy = true;
    if (fs.existsSync(dest)) {
      const destContent = fs.readFileSync(dest, 'utf8');
      if (srcContent === destContent) {
        needsCopy = false;
      }
    }
    if (needsCopy) {
      fs.copyFileSync(src, dest);
      console.log('[MikroGestor] Schema Prisma atualizado no volume a partir do repositório!');
    }
  } catch (err) {
    console.warn('[MikroGestor] Falha ao sincronizar schema.prisma:', err.message);
  }
}
