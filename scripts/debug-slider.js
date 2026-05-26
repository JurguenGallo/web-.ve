const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Title
const titleIdx = html.indexOf('Nuestros Últimos Proyectos de Ingeniería');
if (titleIdx !== -1) {
  const snip = html.substring(Math.max(0, titleIdx - 400), titleIdx + 100);
  console.log('-- TITLE HTML --');
  console.log(snip);
}

// Paragraph
const pIdx = html.indexOf('Cada proyecto es una nueva oportunidad');
if (pIdx !== -1) {
  const snip = html.substring(Math.max(0, pIdx - 400), pIdx + 100);
  console.log('\n-- PARAGRAPH HTML --');
  console.log(snip);
}

// Button
const btnIdx = html.indexOf('Más información');
if (btnIdx !== -1) {
  const snip = html.substring(Math.max(0, btnIdx - 400), btnIdx + 100);
  console.log('\n-- BUTTON HTML --');
  console.log(snip);
}

// Widgets
console.log('\n--- ALL WIDGETS ---');
const widgetRegex = /<div[^>]*class="[^"]*n2-ss-widget[^>]*>/g;
let match;
while ((match = widgetRegex.exec(html)) !== null) {
  console.log(match[0]);
}

