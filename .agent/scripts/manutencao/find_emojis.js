const fs = require('fs');

const file = 'src/app/dashboard/portal/page.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}\u{2B06}\u{2190}-\u{2199}\u{21A9}\u{21AA}]/u;

lines.forEach((line, index) => {
  if (emojiRegex.test(line)) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
