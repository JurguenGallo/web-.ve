const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');

const regex = /portada-venezuela/gi;
const matches = content.match(regex) || [];
console.log(`Found ${matches.length} matches of 'portada-venezuela'`);
if (matches.length > 0) {
  const idx = content.indexOf('portada-venezuela');
  console.log("Context:", content.substring(idx - 100, idx + 100));
}
