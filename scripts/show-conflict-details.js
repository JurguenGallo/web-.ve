const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const lines = content.split('\n');

for (let i = 3; i < 22; i++) {
  console.log(`--- Line ${i + 1} (Length: ${lines[i].length}) ---`);
  console.log(lines[i]);
}
