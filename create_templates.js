const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'hotspot');
const models = [
  {
    name: 'hotspot_hotel',
    colors: { brand: '#B8860B', brandDark: '#8B6508', bg: '#F5F5DC', ink: '#333', blue: '#000080', green: '#B8860B' },
    buttonText: 'Acesso Hóspede',
    trialText: 'Acesso Visitante',
    title: 'Wi-Fi Hotel'
  },
  {
    name: 'hotspot_pizzaria',
    colors: { brand: '#DC143C', brandDark: '#8B0000', bg: '#FFF8DC', ink: '#111', blue: '#FFA500', green: '#DC143C' },
    buttonText: 'Ganhe um Brinde',
    trialText: 'Acesso Rápido',
    title: 'Wi-Fi Pizzaria'
  },
  {
    name: 'hotspot_igreja',
    colors: { brand: '#4682B4', brandDark: '#104E8B', bg: '#F0F8FF', ink: '#222', blue: '#4682B4', green: '#5F9EA0' },
    buttonText: 'Conectar',
    trialText: 'Acesso Visitante',
    title: 'Wi-Fi Igreja'
  },
  {
    name: 'hotspot_academia',
    colors: { brand: '#32CD32', brandDark: '#006400', bg: '#1A1A1A', ink: '#FFF', blue: '#FF4500', green: '#32CD32' },
    buttonText: 'Treino Conectado',
    trialText: 'Passe Livre',
    title: 'Wi-Fi Academia'
  },
  {
    name: 'hotspot_clinica',
    colors: { brand: '#20B2AA', brandDark: '#008080', bg: '#F5FFFA', ink: '#2F4F4F', blue: '#4682B4', green: '#20B2AA' },
    buttonText: 'Acesso Paciente',
    trialText: 'Acesso Rápido',
    title: 'Wi-Fi Clínica'
  }
];

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

models.forEach(model => {
  const targetDir = path.join(__dirname, model.name);
  console.log(`Criando ${model.name}...`);
  copyFolderSync(baseDir, targetDir);
  
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
  
  // Update body color if dark theme
  if(model.colors.bg === '#1A1A1A') {
    html = html.replace(/color: #111827;/g, 'color: #FFF;');
    html = html.replace(/background: #fff;/g, 'background: #333;');
    html = html.replace(/id="box"/g, 'id="box" style="background:#222; color:#fff;"');
  }

  fs.writeFileSync(loginPath, html);
  
  // Update config.json as well just in case
  const configPath = path.join(targetDir, 'config.json');
  if(fs.existsSync(configPath)) {
    let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.colors = model.colors;
    config.businessName = model.title;
    config.registerButtonText = model.buttonText;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
});

console.log('Done!');
