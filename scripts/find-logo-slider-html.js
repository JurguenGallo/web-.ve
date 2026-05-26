const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');

const target = 'id="n2-ss-6-align"';
const idx = content.indexOf(target);
if (idx !== -1) {
  const start = Math.max(0, idx - 800);
  const end = Math.min(content.length, idx + 1500);
  console.log("--- FOUND CONTEXT ---");
  console.log(content.substring(start, end));
} else {
  console.log("Could not find n2-ss-6-align");
}
