const fs = require('fs');
const path = require('path');

const hotspotDir = path.join(__dirname, '..', 'hotspot');
const dirs = fs.readdirSync(hotspotDir);

const btnHtml = `
<!-- Botões Injetados Globalmente -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
  <button type="button" class="btn btn-cad" style="background: #10b981; color: white; border: none; border-radius: 8px; padding: 10px; font-weight: bold; cursor: pointer; width: 100%; font-size: 14px;" onclick="window.location.href='$(link-login-only)'.replace('/login', '') + '/portal/register?link-login-only=$(link-login-only)&link-orig=$(link-orig)'">Cadastro / 15 Min</button>
  <button type="button" class="btn btn-login" style="background: #3b82f6; color: white; border: none; border-radius: 8px; padding: 10px; font-weight: bold; cursor: pointer; width: 100%; font-size: 14px;" onclick="window.location.href='$(link-login-only)'.replace('/login', '') + '/portal/planos'">Comprar Voucher</button>
</div>
`;

dirs.forEach(dir => {
  const loginPath = path.join(hotspotDir, dir, 'login.html');
  if (fs.existsSync(loginPath)) {
    let html = fs.readFileSync(loginPath, 'utf8');
    
    // Remover botões antigos se houver
    html = html.replace(/<button\s+id="btnSignup"[\s\S]*?<\/button>/gi, '');
    
    if (!html.includes('Botões Injetados Globalmente')) {
       if (html.includes('</form>')) {
           html = html.replace('</form>', `${btnHtml}\n</form>`);
       } else if (html.includes('</body>')) {
           html = html.replace('</body>', `${btnHtml}\n</body>`);
       }
       fs.writeFileSync(loginPath, html, 'utf8');
       console.log(`[+] Injetado botões em ${dir}/login.html`);
    }
  }
});
