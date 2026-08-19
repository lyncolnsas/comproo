const fs = require('fs');
const path = require('path');

const previewRoute = path.resolve('src/app/api/portal/preview/route.ts');
let previewContent = fs.readFileSync(previewRoute, 'utf8');

const lockCryptoBlock = `        } else if (effect === 'lock-crypto' || effect === 'wifi_lock') {
          fxContainer.innerHTML = '<canvas id="mg-live-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; background:#030612;"></canvas>';
          var c = document.getElementById('mg-live-canvas');
          if (c) {
            var ctx = c.getContext('2d');
            function rsz() { c.width = window.innerWidth; c.height = window.innerHeight; }
            rsz(); window.addEventListener('resize', rsz);
            var a1 = 0, a2 = 0, a3 = 0;
            function loop() {
              ctx.clearRect(0, 0, c.width, c.height);
              var cx = c.width / 2, cy = c.height / 2;
              var spdM = speed === 'fast' ? 1.5 : speed === 'slow' ? 0.5 : 1;
              a1 += 0.01 * spdM; a2 -= 0.015 * spdM; a3 += 0.008 * spdM;
              ctx.lineWidth = 2;
              ctx.beginPath(); ctx.arc(cx, cy, 140, a1, a1 + Math.PI * 1.4); ctx.strokeStyle = brand; ctx.stroke();
              ctx.beginPath(); ctx.arc(cx, cy, 200, a2, a2 + Math.PI * 1.2); ctx.strokeStyle = green; ctx.stroke();
              ctx.beginPath(); ctx.arc(cx, cy, 260, a3, a3 + Math.PI * 1.5); ctx.strokeStyle = blue; ctx.stroke();
              activeRaf = requestAnimationFrame(loop);
            }
            loop();
          }
`;

const target = "} else if (effect === 'synthwave-arcade'";

if (previewContent.includes(target)) {
  previewContent = previewContent.replace(target, lockCryptoBlock + target);
  fs.writeFileSync(previewRoute, previewContent, 'utf8');
  console.log('Successfully injected lock-crypto into preview/route.ts');
} else {
  console.error('Target not found.');
}
