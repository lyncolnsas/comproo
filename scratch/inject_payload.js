const fs = require('fs');
const path = require('path');

const previewRoute = path.resolve('src/app/api/portal/preview/route.ts');
const payloadPath = path.resolve('scratch/payload.js');

let previewContent = fs.readFileSync(previewRoute, 'utf8');
const payloadContent = fs.readFileSync(payloadPath, 'utf8');

const target = `            loop();
          }
        } else {
          // Particles / General Fallback for all other node engines`;

if (previewContent.includes(target)) {
  previewContent = previewContent.replace(target, payloadContent);
  fs.writeFileSync(previewRoute, previewContent, 'utf8');
  console.log('Successfully injected missing effects into preview/route.ts');
} else {
  console.error('Target string not found in preview/route.ts');
}
