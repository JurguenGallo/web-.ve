const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');

const lines = content.split('\n');
let inside = false;
let chunk = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('<<<<<<<') || line.includes('=======') || line.includes('>>>>>>>')) {
    console.log(`Line ${i + 1}: ${line.substring(0, 100)}`);
    inside = true;
  }
  if (inside) {
    chunk.push({ num: i + 1, text: line });
  }
  if (line.includes('>>>>>>>')) {
    inside = false;
    console.log("--- CHUNK START ---");
    chunk.forEach(c => {
      console.log(`${c.num}: ${c.text.substring(0, 150)}`);
    });
    console.log("--- CHUNK END ---\n");
    chunk = [];
  }
}
