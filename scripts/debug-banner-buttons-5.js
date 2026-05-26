const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const layers = html.split('class="n2-ss-layer');
for (let i = 0; i < layers.length; i++) {
  if (layers[i].includes('CONOCE M') || layers[i].includes('COTIZA AQU')) {
    console.log(`\n--- LAYER ---`);
    console.log(layers[i].substring(0, 500));
  }
}
