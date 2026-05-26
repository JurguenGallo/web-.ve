const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// We want to add margin-top to the unified class n-uc-v4jKxhYiQXlh
const styleInjection = `
<style>
  /* Empujar botones del slider hacia abajo */
  .n-uc-v4jKxhYiQXlh {
    margin-top: 50px !important;
  }
</style>
</head>`;

if (!html.includes('Empujar botones del slider hacia abajo')) {
  html = html.replace('</head>', styleInjection);
  fs.writeFileSync(indexFile, html, 'utf8');
  console.log('Botones empujados 50px hacia abajo exitosamente.');
} else {
  console.log('La regla ya había sido inyectada.');
}
