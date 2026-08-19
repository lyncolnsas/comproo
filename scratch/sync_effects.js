const fs = require('fs');
const path = require('path');

const previewRoute = path.resolve('src/app/api/portal/preview/route.ts');
const configRoute = path.resolve('src/app/api/portal/config/route.ts');

// 1. In config/route.ts, add the background transparency rule if bg.url is set.
let configContent = fs.readFileSync(configRoute, 'utf8');
const configMarker = 'jsEffects += fx.js;\n  }';
if (configContent.includes('jsEffects += fx.js;') && !configContent.includes('transparent !important; }\\n`')) {
  configContent = configContent.replace(
    '    jsEffects += fx.js;\n  }',
    `    jsEffects += fx.js;\n    if (bg && bg.url) {\n      cssEffects += \`\\n#mg-fx-niche, #mg-fx-canvas-particles, #mg-fx-canvas-matrix, #mg-fx-canvas-warp, #mg-fx-canvas-waves, #mg-fx-cybergrid, #mg-fx-orbs, #mg-fx-fireflies, #mg-fx-aurora { background: transparent !important; }\\n\`;\n    }\n  }`
  );
  fs.writeFileSync(configRoute, configContent, 'utf8');
  console.log('Updated config/route.ts for transparent backgrounds.');
}

// 2. In preview/route.ts, add the background transparency rule inside applyLiveConfig.
let previewContent = fs.readFileSync(previewRoute, 'utf8');
if (!previewContent.includes('mg-fx-bg-override')) {
  const previewInjection = `
      // Inject background override if image/video is active
      var bgOverride = document.getElementById('mg-fx-bg-override');
      if (bgOverride) bgOverride.remove();
      if (config.bg && config.bg.url) {
        var styleEl = document.createElement('style');
        styleEl.id = 'mg-fx-bg-override';
        styleEl.innerHTML = '#mg-live-canvas, #mg-fx-aurora, #mg-fx-orbs, #mg-fx-cybergrid, #mg-fx-fireflies { background: transparent !important; }';
        fxContainer.appendChild(styleEl);
      }
      
      clearActiveFX();`;
  
  previewContent = previewContent.replace('clearActiveFX();', previewInjection.trim());
  fs.writeFileSync(previewRoute, previewContent, 'utf8');
  console.log('Updated preview/route.ts for transparent backgrounds.');
}

console.log('Done.');
