const fs = require('fs');
const path = require('path');

const model = {
  name: 'hotspot_futebol_copa',
  img: 'bg_futebol_1781579036669.png',
  colors: { brand: '#FFD700', brandDark: '#DAA520', bg: '#006400', ink: '#FFF', blue: '#1E90FF', green: '#32CD32' },
  buttonText: 'Conectar e Torcer',
  trialText: 'Acesso Rápido',
  title: 'Wi-Fi na Torcida'
};

const baseDir = path.join(__dirname, 'hotspot');
const targetDir = path.join(__dirname, model.name);
const brainDir = 'C:\\Users\\lyncoln.silva\\.gemini\\antigravity\\brain\\f1749f4b-df09-4364-9e3d-7202e2ea986d';

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to);
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

console.log(`Criando ${model.name}...`);
copyFolderSync(baseDir, targetDir);

// Copy image
const srcImg = path.join(brainDir, model.img);
const destImg = path.join(targetDir, 'bg.png');
if(fs.existsSync(srcImg)) {
  fs.copyFileSync(srcImg, destImg);
}

// Edit login.html
const loginPath = path.join(targetDir, 'login.html');
let html = fs.readFileSync(loginPath, 'utf8');

// Replace colors
html = html.replace(/--brand: (.*?);/g, `--brand: ${model.colors.brand};`);
html = html.replace(/--brand-dark: (.*?);/g, `--brand-dark: ${model.colors.brandDark};`);
html = html.replace(/--bg: (.*?);/g, `--bg: ${model.colors.bg};`);
html = html.replace(/--ink: (.*?);/g, `--ink: ${model.colors.ink};`);
html = html.replace(/--blue: (.*?);/g, `--blue: ${model.colors.blue};`);
html = html.replace(/--green: (.*?);/g, `--green: ${model.colors.green};`);

// Replace text
html = html.replace(/Cadastro Sorteio/g, model.buttonText);
html = html.replace(/Não quero sorteio</g, `${model.trialText}<`);

// Change CSS layout
html = html.replace(/body\s*{([^}]*)}/g, (match, content) => {
  return `body {
    margin: 0;
    min-height: 100vh;
    background: url('bg.png') no-repeat center center fixed;
    background-size: cover;
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }`;
});

html = html.replace(/#heading\s*{([^}]*)}/g, '#heading { display: none !important; }');
html = html.replace(/#iden\s*img\s*{([^}]*)}/g, '#iden img { display: none !important; }');
html = html.replace(/#box\s*{([^}]*)}/g, (match, content) => {
  return `#box {
    position: relative;
    width: 95%;
    max-width: 420px;
    background: rgba(0, 0, 0, 0.85); /* Tema escuro combina com luzes do estadio */
    color: #FFF;
    border-radius: 12px;
    padding: 30px 24px;
    margin: 0 auto;
    box-shadow: 0 12px 32px rgba(0, 0, 0, .5);
  }`;
});

// Update input styles for dark mode
html = html.replace(/#user,\s*#pass\s*{([^}]*)}/g, (match, content) => {
  return `#user,
  #pass {
    border: 1px solid #444;
    color: #fff;
    background: #222;
    height: 48px;
    font-size: 16px;
    display: block;
    width: 100%;
    text-align: left;
    border-radius: 10px;
    padding: 0 12px;
    margin: 8px 0;
    -webkit-appearance: none;
    appearance: none;
  }`;
});

// add a title inside box
const titleColor = model.colors.brand; // Amarelo/Dourado Copa
const header = `<h2 class="title-model" style="text-align: center; color: ${titleColor}; margin-top: 0; margin-bottom: 24px; font-size: 24px;">${model.title}</h2>\n        <div>`;
html = html.replace(/<div>\s*<input id="user"/, header + '<input id="user"');

// Remove top: 80px if left over in styles
html = html.replace(/top: 80px;/g, 'top: 0;');

fs.writeFileSync(loginPath, html);

// Update config.json
const configPath = path.join(targetDir, 'config.json');
if(fs.existsSync(configPath)) {
  let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.colors = model.colors;
  config.businessName = model.title;
  config.registerButtonText = model.buttonText;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

console.log('Done!');
