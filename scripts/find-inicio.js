const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

const regex = /<a[^>]*>(?:<[^>]+>)*Inicio(?:<[^>]+>)*<\/a>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log(match[0]);
}

// Or just look for "Inicio" and grab the <a> tag
const inicioIndex = html.indexOf('Inicio');
if (inicioIndex !== -1) {
  const aStart = html.lastIndexOf('<a', inicioIndex);
  const aEnd = html.indexOf('</a>', inicioIndex) + 4;
  console.log('Found link:');
  console.log(html.substring(aStart, aEnd));
}
