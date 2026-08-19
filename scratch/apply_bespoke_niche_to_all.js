const fs = require('fs');
const path = require('path');
const { getNicheEffectMarkup } = require('./niche_engines_data');

const templateNicheMap = {
  'academia': 'cardio-pulse',
  'igreja': 'divine-rays',
  'clinica': 'medical-vital',
  'pizzaria': 'woodfire-embers',
  'hotel': 'luxury-bubbles',
  'futebol_copa': 'stadium-lights',
  'fifa-26.otf': 'stadium-lights',
  'Digital_Ocean': 'digital-ocean',
  'Popcorn': 'cinema-marquee',
  'Escuela': 'chalk-constellation',
  'Greenboard': 'chalk-constellation',
  'Traffic-Control': 'traffic-radar',
  'shield': 'hex-shield',
  'wifi_lock': 'lock-crypto',
  'LinkingNet': 'fiber-optic',
  'Launcher': 'fiber-optic',
  'UserKeys': 'synthwave-arcade',
  'WifiElBarrio': 'barrio-sunset',
  'Wifi El Barrio': 'barrio-sunset',
  'WiFi_Community': 'community-bubbles',
  'workspace': 'workspace-ribbons',
  'Window-orange-login': 'sunset-glass',
  'Nougat': 'nougat-fluid',
  'Random': 'prisma-holo',
  'default': 'particles'
};

const hotspotDir = path.join(__dirname, '..', 'hotspot');
const templates = fs.readdirSync(hotspotDir);

templates.forEach(t => {
  const dir = path.join(hotspotDir, t);
  if (!fs.statSync(dir).isDirectory()) return;

  const configPath = path.join(dir, 'config.json');
  const loginPath = path.join(dir, 'login.html');
  if (!fs.existsSync(loginPath)) return;

  let config = {};
  if (fs.existsSync(configPath)) {
    try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
  }

  const nicheEffect = templateNicheMap[t] || 'particles';
  if (!config.effects) config.effects = {};
  config.effects.bgEffect = nicheEffect;

  const colors = config.colors || { brand: '#2563eb', brandDark: '#1d4ed8', blue: '#2563eb', green: '#10b981' };
  const speed = config.effects.bgEffectSpeed || 'normal';

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

  // Compile into login.html
  let html = fs.readFileSync(loginPath, 'utf8');
  const { html: bgHtml, css: cssEffects, js: jsEffects } = getNicheEffectMarkup(nicheEffect, speed, colors.brand, colors.brandDark, colors.blue, colors.green);

  const fullEffectMarkup = `<!-- MIKROGESTOR EFFECTS -->\n${bgHtml}\n<style id="mg-fx-css">\n${cssEffects}\n</style>\n<script id="mg-fx-js">\n${jsEffects}\n</script>\n<!-- /MIKROGESTOR EFFECTS -->`;

  const effectRegex = /<!-- MIKROGESTOR EFFECTS -->[\s\S]*?<!-- \/MIKROGESTOR EFFECTS -->/;
  if (effectRegex.test(html)) {
    html = html.replace(effectRegex, fullEffectMarkup);
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', `${fullEffectMarkup}\n</body>`);
  } else {
    html += fullEffectMarkup;
  }

  fs.writeFileSync(loginPath, html, 'utf8');
  console.log(`✓ Applied unique niche engine [${nicheEffect}] to: ${t}`);
});

console.log("All templates updated successfully!");
