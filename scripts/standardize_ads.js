const fs = require('fs');
const path = require('path');

const hotspotDir = path.join(__dirname, '..', 'hotspot');
const dirs = fs.readdirSync(hotspotDir);

dirs.forEach(dir => {
  const loginPath = path.join(hotspotDir, dir, 'login.html');
  if (fs.existsSync(loginPath)) {
    let html = fs.readFileSync(loginPath, 'utf8');
    let changed = false;

    // 1. Injetar CustomBackground e AdCarouselBlock logo após o <body>
    if (!/AdCarouselBlock/i.test(html)) {
      html = html.replace(/(<body[^>]*>)/i, `$1\n<!-- CustomBackground -->\n<!-- EndCustomBackground -->\n\n<!-- AdCarouselBlock -->\n<!-- EndAdCarouselBlock -->\n`);
      changed = true;
    }

    // 2. Injetar AdCarouselStyles no final do <style> existente, ou antes de </head>
    if (!/AdCarouselStyles/i.test(html)) {
      if (/<\/style>/i.test(html)) {
        html = html.replace(/(<\/style>)/i, `/* AdCarouselStyles */\n/* EndAdCarouselStyles */\n$1`);
      } else {
        html = html.replace(/(<\/head>)/i, `<style>\n/* AdCarouselStyles */\n/* EndAdCarouselStyles */\n</style>\n$1`);
      }
      changed = true;
    }

    // 3. Injetar AdCarouselScript antes de </body>
    if (!/AdCarouselScript/i.test(html)) {
      if (/<\/body>/i.test(html)) {
        html = html.replace(/(<\/body>)/i, `<script>\n/* AdCarouselScript */\n/* EndAdCarouselScript */\n</script>\n$1`);
      } else {
        html += `\n<script>\n/* AdCarouselScript */\n/* EndAdCarouselScript */\n</script>\n`;
      }
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(loginPath, html, 'utf8');
      console.log(`[+] Padronizado: ${dir}/login.html`);
    } else {
      console.log(`[-] Já estava padronizado: ${dir}/login.html`);
    }
  }
});
