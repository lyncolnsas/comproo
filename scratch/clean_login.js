const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/lyncoln.silva/OneDrive - Adventistas/Documentos/Projetos-/Mikhmon/mikhmon/mikrogestor-voucher/hotspot/login.html';

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF to perform match safely, then write back as LF or CRLF
const normalized = content.replace(/\r\n/g, '\n');

const duplicateBlock = `  \$(if chap-id)
  <form name="sendin" action="\$(link-login-only)" method="post">
    <input type="hidden" name="username" />
    <input type="hidden" name="password" />
    <input type="hidden" name="dst" value="\$(link-orig)" />
    <input type="hidden" name="popup" value="true" />
  </form>

  <script>
    function doLogin() {
      document.sendin.username.value = document.login.username.value;
      document.sendin.password.value = hexMD5('\$(chap-id)' + document.login.password.value + '\$(chap-challenge)');
      document.sendin.submit();
      return false;
    }
  </script>
  \$(endif)

  \$(if error)<div class="err">\$(error)</div>\$(endif)

  <div id="heading">
    <div id="wifilock"><img src="wifi-lock.png" alt="Wi-Fi"></div>
  </div>
  <div id="iden"><img src="human.png" alt="Avatar"></div>

  <form class="vertical-form" name="login" action="\$(link-login-only)" method="post" \$(if chap-id) onSubmit="return doLogin()" \$(endif)>
<!-- EndAdCarouselBlock -->`;

const targetNormalized = duplicateBlock.replace(/\r\n/g, '\n');

if (normalized.includes(targetNormalized)) {
  const result = normalized.replace(targetNormalized, '');
  // Save with normalized CRLF if original had CRLF, or just keep LF
  const finalContent = content.includes('\r\n') ? result.replace(/\n/g, '\r\n') : result;
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('Successfully cleaned up login.html duplicate block.');
} else {
  console.error('Target duplicate block not found in login.html.');
}
