const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

const regex = /<div[^>]*class="[^"]*n2-ss-widget[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;

let match;
console.log('--- WIDGETS ---');
while ((match = regex.exec(html)) !== null) {
  const snip = match[0];
  if (snip.includes('autoplay') || snip.includes('circle') || snip.includes('svg')) {
    console.log(snip.substring(0, 300) + '...\n');
  }
}

// Alternatively, just search for <svg
console.log('--- SVGs ---');
const svgRegex = /<svg[\s\S]*?<\/svg>/g;
while ((match = svgRegex.exec(html)) !== null) {
  if (match[0].includes('circle')) {
    console.log(match[0].substring(0, 300) + '...\n');
  }
}
