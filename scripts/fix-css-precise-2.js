const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

if (html.includes('font-size: 85% !important;')) {
  html = html.replace('font-size: 85% !important;', 'font-size: 34px !important;');
  fs.writeFileSync(indexFile, html, 'utf8');
  console.log('Updated font size to 34px');
} else {
  console.log('Could not find the 85% font size.');
}
