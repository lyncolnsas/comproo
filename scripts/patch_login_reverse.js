const fs = require('fs');
const path = require('path');

const hotspotDir = path.join(__dirname, 'hotspot');

const waFormBlock = `
<div id="wa-form-container" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid rgba(255,255,255,0.1);">
  <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #25D366; text-align: center;">Liberar via WhatsApp</p>
  <p style="margin: 0 0 15px 0; font-size: 12px; color: #bbb; text-align: center;">Digite seu número e liberaremos o acesso na hora!</p>
  
  <div style="display: flex; gap: 8px; margin-bottom: 15px;">
    <select id="wa-ddi" style="width: 110px; padding: 12px 5px; border-radius: 8px; border: 1px solid #444; background: #222; color: #fff; font-size: 14px; outline: none; appearance: auto;">
      <option value="55" selected>🇧🇷 +55</option>
      <option value="1">🇺🇸 +1</option>
      <option value="351">🇵🇹 +351</option>
      <option value="54">🇦🇷 +54</option>
      <option value="598">🇺🇾 +598</option>
      <option value="595">🇵🇾 +595</option>
      <option value="56">🇨🇱 +56</option>
      <option value="57">🇨🇴 +57</option>
    </select>
    <input type="tel" id="wa-phone" placeholder="DDD + Número" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #444; background: #222; color: #fff; font-size: 14px; outline: none; width: 100%; box-sizing: border-box;" onkeypress="return event.charCode >= 48 && event.charCode <= 57">
  </div>
  
  <button type="button" id="btn-wa-start" onclick="startWhatsAppFlow('$(mac)', '$(ip)')" style="width: 100%; background: #25D366; color: white; border: none; border-radius: 8px; padding: 14px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;">
    INICIAR ACESSO
  </button>
</div>
`;

const scriptBlock = `
<script>
function startWhatsAppFlow(mac, ip) {
  var ddi = document.getElementById('wa-ddi').value;
  var phone = document.getElementById('wa-phone').value.replace(/\\D/g, '');
  var btn = document.getElementById('btn-wa-start');
  
  if (phone.length < 8) {
    alert('Por favor, digite um número válido.');
    return;
  }
  
  var fullNumber = ddi + phone;
  btn.innerHTML = 'Liberando internet...';
  btn.disabled = true;
  
  fetch('http://192.168.88.215/api/portal/whatsapp-flow/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mac: mac, ip: ip, phone: fullNumber })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if(data.success) {
       document.getElementById('wa-form-container').innerHTML = '<div style="text-align:center; padding: 10px 0;"><h3 style="color:#25D366; margin:0 0 10px 0;">✔ Acesso Liberado!</h3><p style="color:#fff; font-size:14px; line-height:1.5;">Acabamos de te mandar um "Oi" no WhatsApp.<br><br><b>Pode fechar esta tela e abrir seu WhatsApp.</b></p></div>';
    } else {
       alert('Erro: ' + (data.error || 'Não foi possível liberar.'));
       btn.innerHTML = 'INICIAR ACESSO';
       btn.disabled = false;
    }
  })
  .catch(function(err) {
    alert('Erro de conexao: ' + err.message);
    btn.innerHTML = 'INICIAR ACESSO';
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
      
      // Limpa coisas velhas:
      // Remove <script> function doWhatsAppLogin ... </script>
      content = content.replace(/<script>\s*function doWhatsAppLogin[\s\S]*?<\/script>/g, '');
      // Remove fallback button
      content = content.replace(/<a id="btn-fallback-wa"[^>]*>.*?<\/a>/g, '');
      // Remove script velho de startWhatsAppFlow se já existisse num teste prévio
      content = content.replace(/<script>\s*function startWhatsAppFlow[\s\S]*?<\/script>/g, '');
      
      // Localiza e remove o botão verde de WhatsApp antigo:
      // O botão que começa com <button type="button" id="btn-wa-login" ...> ... </button>
      content = content.replace(/<button type="button" id="btn-wa-login"[\s\S]*?<\/button>/g, waFormBlock);
      
      // Se não encontrou o botão (talvez já tenha sido alterado para algo diferente), 
      // ou se quiser trocar a div wa-form-container já existente:
      const waFormContainerRegex = /<div id="wa-form-container"[\s\S]*?<\/div>\s*<\/div>/g; 
      // É meio perigoso apagar </div>. O replace do botão é mais seguro porque já sabemos a string do botão.
      
      // Remove duplicate wa-form-container se acontecer
      const waFormCount = (content.match(/<div id="wa-form-container"/g) || []).length;
      if (waFormCount > 1) {
          console.warn("Múltiplos formulários em", fullPath);
      }
      
      content = content.replace('</body>', scriptBlock + '\n</body>');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Patched new Form into login.html:', fullPath);
    }
  }
}

processDir(hotspotDir);
console.log('Done refactoring login UI to reverse flow');
