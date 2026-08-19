const fs = require('fs');
const path = require('path');

const hotspotDir = path.join(__dirname, 'hotspot');

const waFormBlock = `
<div id="wa-form-container" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid rgba(255,255,255,0.1);">
  <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #25D366; text-align: center;">Acesso via WhatsApp</p>
  
  <div id="wa-step-1">
    <button type="button" onclick="document.getElementById('wa-step-1').style.display='none'; document.getElementById('wa-step-2').style.display='block';" style="width: 100%; background: #25D366; color: white; border: none; border-radius: 8px; padding: 14px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;">
      SOLICITAR ACESSO
    </button>
  </div>

  <div id="wa-step-2" style="display: none;">
    <p style="margin: 0 0 15px 0; font-size: 12px; color: #bbb; text-align: center;">Digite seu número para receber o Token de acesso:</p>
    
    <div style="display: flex; gap: 8px; margin-bottom: 15px;">
      <select id="wa-ddi" style="width: 90px; padding: 12px 5px; border-radius: 8px; border: 1px solid #444; background: #222; color: #fff; font-size: 14px; outline: none; appearance: auto;">
        <option value="55" selected>🇧🇷 +55</option>
        <option value="1">🇺🇸 +1</option>
        <option value="351">🇵🇹 +351</option>
        <option value="54">🇦🇷 +54</option>
        <option value="598">🇺🇾 +598</option>
        <option value="595">🇵🇾 +595</option>
        <option value="56">🇨🇱 +56</option>
        <option value="57">🇨🇴 +57</option>
      </select>
      <input type="tel" id="wa-ddd" placeholder="DDD" maxlength="3" style="width: 60px; padding: 12px; border-radius: 8px; border: 1px solid #444; background: #222; color: #fff; font-size: 14px; outline: none; text-align: center;" onkeypress="return event.charCode >= 48 && event.charCode <= 57">
      <input type="tel" id="wa-phone" placeholder="Número" maxlength="10" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #444; background: #222; color: #fff; font-size: 14px; outline: none; width: 100%; box-sizing: border-box;" onkeypress="return event.charCode >= 48 && event.charCode <= 57">
    </div>
    
    <button type="button" id="btn-wa-start" onclick="startWhatsAppFlow('$(mac)', '$(ip)')" style="width: 100%; background: #25D366; color: white; border: none; border-radius: 8px; padding: 14px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;">
      RECEBER TOKEN
    </button>
  </div>
</div>
`;

const scriptBlock = `
<script>
function startWhatsAppFlow(mac, ip) {
  var ddi = document.getElementById('wa-ddi').value;
  var ddd = document.getElementById('wa-ddd').value.replace(/\\D/g, '');
  var phone = document.getElementById('wa-phone').value.replace(/\\D/g, '');
  var btn = document.getElementById('btn-wa-start');
  
  if (ddd.length < 2) {
    alert('Por favor, digite o DDD corretamente.');
    return;
  }
  
  if (phone.length < 8) {
    alert('Por favor, digite um número de telefone válido.');
    return;
  }
  
  // Remove o nono dígito (9 inicial) se for Brasil e o número tiver 9 dígitos
  if (ddi === '55' && phone.length === 9 && phone.charAt(0) === '9') {
    phone = phone.substring(1);
  }
  
  var fullNumber = ddi + ddd + phone;
  btn.innerHTML = 'Aguarde...';
  btn.disabled = true;
  
  fetch('http://portal.wifi.local/api/portal/whatsapp-flow/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mac: mac, ip: ip, phone: fullNumber })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if(data.success) {
       var modalHtml = '<div id="wa-success-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:99999; padding:20px; box-sizing:border-box;">' +
       '<div style="background:#222; border-radius:16px; padding:30px 20px; text-align:center; width:100%; max-width:350px; box-shadow:0 10px 40px rgba(0,0,0,0.5); border: 1px solid #444;">' +
       '<div style="width:70px; height:70px; background:#25D366; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px auto;"><svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>' +
       '<h2 style="color:#fff; margin:0 0 10px 0; font-size:22px; font-family:sans-serif;">Mensagem Enviada!</h2>' +
       '<p style="color:#ccc; font-size:16px; line-height:1.5; margin-bottom:25px; font-family:sans-serif;">Vá para o seu <b>WhatsApp</b> para finalizar o seu cadastro.</p>' +
       '<button onclick="document.getElementById(\\'wa-success-modal\\').remove()" style="background:#333; color:#fff; border:1px solid #555; border-radius:8px; padding:14px 20px; font-weight:bold; width:100%; font-size:15px; cursor:pointer; transition:0.2s;">FECHAR TELA</button>' +
       '</div></div>';
       document.body.insertAdjacentHTML('beforeend', modalHtml);
       
       // Update original container text too just in case they close the modal
       document.getElementById('wa-form-container').innerHTML = '<div style="text-align:center; padding: 10px 0;"><h3 style="color:#25D366; margin:0 0 10px 0;">✔ Mensagem Enviada</h3><p style="color:#ccc; font-size:14px;">Verifique o seu WhatsApp para continuar.</p></div>';
    } else {
       alert('Erro: ' + (data.error || 'Não foi possível liberar.'));
       btn.innerHTML = 'RECEBER TOKEN';
       btn.disabled = false;
    }
  })
  .catch(function(err) {
    alert('Erro de conexao: ' + err.message);
    btn.innerHTML = 'RECEBER TOKEN';
    btn.disabled = false;
  });
}
</script>
`;

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file === 'login.html') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove blocos antigos (do patch_login_reverse antigo que botava só wa-form-container)
      content = content.replace(/<div id="wa-form-container"[\s\S]*?<\/div>\s*<\/div>/g, '');
      content = content.replace(/<div id="wa-form-container"[\s\S]*?<\/button>\s*<\/div>/g, ''); 
      content = content.replace(/<script>\s*function startWhatsAppFlow[\s\S]*?<\/script>/g, '');
      
      // Busca a marcação e injeta a nova (vou injetar antes de </body> pra garantir, ou depois de $(if error))
      // Mas para manter no lugar certo, procuro pelo form de login do mikrotik
      if (content.includes('</form>')) {
         content = content.replace('</form>', '</form>\n' + waFormBlock);
      } else {
         content = content.replace('</body>', waFormBlock + '\n</body>');
      }
      
      content = content.replace('</body>', scriptBlock + '\n</body>');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Patched new UI into login.html:', fullPath);
    }
  }
}

processDir(hotspotDir);
console.log('Done refactoring UI with Solicitar Acesso button');
