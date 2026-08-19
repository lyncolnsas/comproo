const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalLanIp() {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = '';

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          if (alias.address.startsWith('192.168.') || alias.address.startsWith('10.')) {
            localIp = alias.address;
            break;
          } else if (!localIp) {
            localIp = alias.address;
          }
        }
      }
      if (localIp && (localIp.startsWith('192.168.') || localIp.startsWith('10.'))) {
        break;
      }
    }
    return localIp || '192.168.88.215';
  } catch (e) {
    return '192.168.88.215';
  }
}

const systemIp = getLocalLanIp();
const hotspotDir = path.join(__dirname, '..', 'hotspot');
const dirs = fs.readdirSync(hotspotDir);

const btnHtml = `
<!-- Botões Injetados Globalmente -->
<div class="wa-btn-container" style="display: block; width: 100%; box-sizing: border-box; text-align: center; margin-top: 15px; padding: 0 10px;">
  <button type="button" class="btn btn-login" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #25D366; color: white; border: none; border-radius: 8px; padding: 12px; font-weight: bold; cursor: pointer; width: 100%; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s;" onclick="window.location.href='http://${systemIp}/api/portal/whatsapp-flow?mac=$(mac)&ip=$(ip)'">
    <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
    Comprar / Cadastrar via WhatsApp
  </button>
</div>
`;

dirs.forEach(dir => {
  const loginPath = path.join(hotspotDir, dir, 'login.html');
  if (fs.existsSync(loginPath)) {
    let html = fs.readFileSync(loginPath, 'utf8');
    
    // Remover injeções antigas para garantir limpeza
    const blockRegex = /<!-- Botões Injetados Globalmente -->[\s\S]*?<\/div>/gi;
    html = html.replace(blockRegex, '');

    const lastFormIdx = html.lastIndexOf('</form>');
    if (lastFormIdx !== -1) {
      html = html.substring(0, lastFormIdx) + btnHtml + '\n' + html.substring(lastFormIdx);
    } else {
      const bodyIdx = html.lastIndexOf('</body>');
      if (bodyIdx !== -1) {
        html = html.substring(0, bodyIdx) + btnHtml + '\n' + html.substring(bodyIdx);
      }
    }
    
    fs.writeFileSync(loginPath, html, 'utf8');
    console.log(`[+] Corrigido layout do botão em ${dir}/login.html`);
  }
});
