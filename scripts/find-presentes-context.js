const fs = require('fs');
const path = require('path');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');

const regex = /Presentes[^\s"'()]*\.(png|webp|jpg)/gi;
let match;
while ((match = regex.exec(content)) !== null) {
  const start = Math.max(0, match.index - 300);
  const end = Math.min(content.length, match.index + 500);
  console.log(`Match ${match[0]} at index ${match.index}:`);
  console.log(content.substring(start, end));
  console.log("\n-------------------------------------------------\n");
}
