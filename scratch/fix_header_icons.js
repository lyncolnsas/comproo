const fs = require('fs');
const path = require('path');

const hotspotDir = path.join(__dirname, '..', 'hotspot');

function getFiles(dir, match) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, match));
    } else if (file.toLowerCase() === match.toLowerCase()) {
      results.push(fullPath);
    }
  });
  return results;
}

const loginFiles = getFiles(hotspotDir, 'login.html');
console.log(`Found ${loginFiles.length} login.html files.`);

const svgIcon = `<svg style="height: 28px; width: 28px; fill: #ffffff;" viewBox="0 0 24 24"><path d="M12 3C6.95 3 2.5 5.56 0 9.42l2.36 2.36C4.12 8.44 7.78 6.5 12 6.5s7.88 1.94 9.64 5.28L24 9.42C21.5 5.56 17.05 3 12 3zm0 5c-3.31 0-6.29 1.52-8.25 3.91l2.36 2.36C7.39 12.87 9.53 12 12 12s4.61.87 5.89 2.27l2.36-2.36C18.29 9.52 15.31 8 12 8zm0 5c-1.38 0-2.5 1.12-2.5 2.5v.5H9c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-.5v-.5c0-1.38-1.12-2.5-2.5-2.5zm1 3h-2v-.5c0-.55.45-1 1-1s1 .45 1 1v.5z"/></svg>`;

loginFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace <div id="heading"><img src="wifi-lock.png"...></div>
  content = content.replace(
    /<div id="heading">\s*<img[^>]*wifi-lock\.png[^>]*>\s*<\/div>/gi,
    `<div id="heading">\n    ${svgIcon}\n  </div>`
  );

  // Replace <div id="heading">\s*<div id="wifilock">\s*<img[^>]*wifi-lock\.png[^>]*>\s*<\/div>\s*<\/div>
  content = content.replace(
    /<div id="heading">\s*<div id="wifilock">\s*<img[^>]*wifi-lock\.png[^>]*>\s*<\/div>\s*<\/div>/gi,
    `<div id="heading">\n    ${svgIcon}\n  </div>`
  );

  // Replace any standalone <img src="wifi-lock.png"...>
  content = content.replace(
    /<img[^>]*wifi-lock\.png[^>]*>/gi,
    svgIcon
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(hotspotDir, filePath)}`);
  }
});

console.log('Finished updating all login.html files!');
