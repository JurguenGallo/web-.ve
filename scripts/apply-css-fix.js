const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// Inject CSS to hide the overlapping pie indicator
const styleTag = `<style>
  /* Fix overlapping slider widgets */
  .nextend-indicator-pie { display: none !important; }
</style></head>`;

if (!html.includes('.nextend-indicator-pie { display: none !important; }')) {
  html = html.replace('</head>', styleTag);
  fs.writeFileSync(indexFile, html, 'utf8');
  console.log('Injected CSS to hide the pie indicator in index.html');
} else {
  console.log('CSS already injected.');
}
