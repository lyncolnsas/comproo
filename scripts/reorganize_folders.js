const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const newHotspotDir = path.join(rootDir, 'hotspot_new');

if (!fs.existsSync(newHotspotDir)) {
  fs.mkdirSync(newHotspotDir);
}

const items = fs.readdirSync(rootDir, { withFileTypes: true });

for (const item of items) {
  if (item.isDirectory() && item.name.startsWith('hotspot')) {
    if (item.name === 'hotspot_new') continue;
    
    let destName = item.name === 'hotspot' ? 'default' : item.name.replace('hotspot_', '');
    const oldPath = path.join(rootDir, item.name);
    const newPath = path.join(newHotspotDir, destName);
    
    // Rename/move folder
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item.name} to hotspot_new/${destName}`);
  }
}

// Rename hotspot_new to hotspot
const finalHotspotDir = path.join(rootDir, 'hotspot');
if (fs.existsSync(finalHotspotDir)) {
  fs.rmdirSync(finalHotspotDir, { recursive: true });
}
fs.renameSync(newHotspotDir, finalHotspotDir);
console.log('Renamed hotspot_new to hotspot');
