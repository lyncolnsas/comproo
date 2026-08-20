const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '1260516031758-hotspot');
if (fs.existsSync(targetDir)) {
  const dirs = fs.readdirSync(targetDir);
  dirs.forEach(dir => {
    const cfgPath = path.join(targetDir, dir, 'config.json');
    if (fs.existsSync(cfgPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        if (cfg.badges) {
          cfg.badges.showWifiSpeed = false;
          cfg.badges.showSecurityBadge = false;
          cfg.badges.showConnectedCount = false;
        }
        fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
      } catch (e) {}
    }
  });
}
