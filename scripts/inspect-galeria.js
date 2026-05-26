const fs = require('fs');
const path = require('path');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const html = fs.readFileSync(galeriaFile, 'utf8');

// Find where "COLOMBIA" is in the HTML
const idx = html.indexOf('COLOMBIA');
if (idx !== -1) {
  const start = Math.max(0, idx - 300);
  const end = Math.min(html.length, idx + 300);
  console.log('--- COLOMBIA snippet ---');
  console.log(html.substring(start, end));
} else {
  console.log('COLOMBIA not found in galeria/index.html');
}

// Find slider background images
const bgRegex = /<picture[^>]*>[\s\S]*?<\/picture>/g;
let match;
let count = 0;
console.log('\n--- Background Pictures ---');
while ((match = bgRegex.exec(html)) !== null) {
  if (count < 3) {
    console.log(match[0].substring(0, 200) + '...');
  }
  count++;
}
