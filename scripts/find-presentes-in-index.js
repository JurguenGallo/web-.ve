const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');

console.log("Presentes5.png check:", content.includes('Presentes5.png'));
console.log("Presentes768.png check:", content.includes('Presentes768.png'));
if (content.includes('Presentes768.png')) {
  const idx = content.indexOf('Presentes768.png');
  console.log("Presentes768 context:", content.substring(idx - 100, idx + 100));
}
