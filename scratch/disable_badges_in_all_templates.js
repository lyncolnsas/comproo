const fs = require('fs');
const path = require('path');

const hotspotDir = path.join(__dirname, '..', 'hotspot');
const dirs = fs.readdirSync(hotspotDir);

let count = 0;

dirs.forEach(dir => {
  const cfgPath = path.join(hotspotDir, dir, 'config.json');
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      if (cfg.badges) {
        cfg.badges.showWifiSpeed = false;
        cfg.badges.showSecurityBadge = false;
        cfg.badges.showConnectedCount = false;
      } else {
        cfg.badges = {
          showWifiSpeed: false,
          wifiSpeedText: '',
          showSecurityBadge: false,
          securityText: '',
          showConnectedCount: false,
          connectedCountNumber: '0'
        };
      }
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
      console.log(`[UPDATED BADGES] ${dir}/config.json`);
      count++;
    } catch (e) {
      console.error(`Error in ${dir}:`, e.message);
    }
  }
});

console.log(`\nTotal templates with badges disabled: ${count}`);
