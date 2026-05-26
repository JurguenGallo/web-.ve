const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

console.log("whatsapp search in index.html:");
let idx = 0;
while ((idx = html.indexOf('whatsapp', idx)) !== -1) {
  console.log(`- Found 'whatsapp' at ${idx}: ${html.substring(idx - 50, idx + 100)}`);
  idx += 8;
}

console.log("\nctc search in index.html:");
idx = 0;
while ((idx = html.indexOf('ctc', idx)) !== -1) {
  console.log(`- Found 'ctc' at ${idx}: ${html.substring(idx - 50, idx + 100)}`);
  idx += 3;
}
