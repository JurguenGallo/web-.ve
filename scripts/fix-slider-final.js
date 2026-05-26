const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// 1. Revert the text back to short format so the giant font fits perfectly
const longText = 'Nuestros Últimos Proyectos de Ingeniería Eléctrica';
const shortText = 'Últimos proyectos';

if (html.includes(longText)) {
  html = html.replace(longText, shortText);
  console.log('Replaced long text with short text.');
}

// 2. Hide only the specific pie indicator that overlaps the arrow in slider #17
const styleTag = `<style>
  /* Hide overlapping pie indicator ONLY on the first slider */
  div#n2-ss-17 .nextend-indicator-pie { display: none !important; }
</style></head>`;

if (!html.includes('div#n2-ss-17 .nextend-indicator-pie { display: none !important; }')) {
  html = html.replace('</head>', styleTag);
  console.log('Injected CSS to hide only the duplicate circle on slider #17.');
}

fs.writeFileSync(indexFile, html, 'utf8');
