const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Find all script tags containing SmartSliderSimple("n2-ss-17"
const regex = /new _N2\.SmartSlider[^"]*\("n2-ss-17"[^)]*\)/g;
let match;
while ((match = regex.exec(html)) !== null) {
  const start = Math.max(0, match.index - 50);
  const end = Math.min(html.length, match.index + 3000);
  console.log(html.substring(start, end));
  break;
}

// Also search for n2-ss-17 in a script block
const targetStr = 'SmartSlider';
const idx2 = html.indexOf(targetStr);
if (idx2 !== -1) {
  console.log("\nFirst SmartSlider occurrence context:");
  console.log(html.substring(Math.max(0, idx2 - 50), idx2 + 500));
}
