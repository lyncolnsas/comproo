const fs = require('fs');
const path = require('path');

const models = [
  { name: 'hotspot_hotel', img: 'bg_hotel_1781578808425.png' },
  { name: 'hotspot_pizzaria', img: 'bg_pizzaria_1781578819495.png' },
  { name: 'hotspot_igreja', img: 'bg_igreja_1781578829457.png' },
  { name: 'hotspot_academia', img: 'bg_academia_1781578840134.png' },
  { name: 'hotspot_clinica', img: 'bg_clinica_1781578850976.png' }
];

const brainDir = 'C:\\Users\\lyncoln.silva\\.gemini\\antigravity\\brain\\f1749f4b-df09-4364-9e3d-7202e2ea986d';

models.forEach(model => {
  const targetDir = path.join(__dirname, model.name);
  if(!fs.existsSync(targetDir)) return;

  // Copy image
  const srcImg = path.join(brainDir, model.img);
  const destImg = path.join(targetDir, 'bg.png');
  if(fs.existsSync(srcImg)) {
    fs.copyFileSync(srcImg, destImg);
  }

  // Edit login.html
  const loginPath = path.join(targetDir, 'login.html');
  let html = fs.readFileSync(loginPath, 'utf8');

  // Change CSS
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
    let bg = 'rgba(255, 255, 255, 0.9)';
    if(model.name === 'hotspot_academia') {
      bg = 'rgba(0, 0, 0, 0.85)';
    }
    return `#box {
      position: relative;
      width: 95%;
      max-width: 420px;
      background: ${bg};
      border-radius: 12px;
      padding: 30px 24px;
      margin: 0 auto;
      box-shadow: 0 12px 32px rgba(0, 0, 0, .25);
    }`;
  });

  // add a title inside box if not exists
  if (!html.includes('<h2 class="title-model"')) {
    const titleObj = {
      hotspot_hotel: 'Bem-vindo ao Hotel',
      hotspot_pizzaria: 'Wi-Fi da Pizzaria',
      hotspot_igreja: 'Bem-vindo à Igreja',
      hotspot_academia: 'Wi-Fi da Academia',
      hotspot_clinica: 'Wi-Fi da Clínica'
    };
    const color = model.name === 'hotspot_academia' ? '#fff' : 'var(--brand)';
    const header = `<h2 class="title-model" style="text-align: center; color: ${color}; margin-top: 0; margin-bottom: 24px; font-size: 24px;">${titleObj[model.name]}</h2>\n        <div>`;
    html = html.replace(/<div>\s*<input id="user"/, header + '<input id="user"');
  }

  // Remove top: 80px if left over in styles
  html = html.replace(/top: 80px;/g, 'top: 0;');

  fs.writeFileSync(loginPath, html);
  console.log(`Updated ${model.name}`);
});
