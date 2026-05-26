const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Find Smart Slider background images
const bgRegex = /<picture[^>]*>[\s\S]*?<\/picture>/g;
let match;
console.log('--- Background Pictures ---');
let count = 0;
while ((match = bgRegex.exec(html)) !== null) {
  if (count < 3) {
    console.log(`\nPICTURE ${count + 1}:`);
    console.log(match[0].substring(0, 500) + '...');
  }
  count++;
}

// Alternatively, search for data-desktop attributes inside slider
const desktopRegex = /data-desktop="([^"]+)"/g;
console.log('\n--- data-desktop images ---');
while ((match = desktopRegex.exec(html)) !== null) {
    console.log(match[1]);
}
