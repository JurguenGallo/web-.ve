const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// Split HTML into layers
const layers = html.split('class="n2-ss-layer');
let conoceLayerIndex = -1;
let cotizaLayerIndex = -1;

for (let i = 0; i < layers.length; i++) {
  if (layers[i].includes('CONOCE M')) {
    conoceLayerIndex = i;
  }
  if (layers[i].includes('COTIZA AQU')) {
    cotizaLayerIndex = i;
  }
}

if (conoceLayerIndex !== -1 && cotizaLayerIndex !== -1) {
  // Extract top value from CONOCE layer
  const topMatch = layers[conoceLayerIndex].match(/data-desktopportraittop="([^"]+)"/);
  const cotizaMatch = layers[cotizaLayerIndex].match(/data-desktopportraittop="([^"]+)"/);
  
  if (topMatch && cotizaMatch) {
    const topConoce = topMatch[1];
    const topCotiza = cotizaMatch[1];
    
    console.log(`CONOCE top: ${topConoce}`);
    console.log(`COTIZA top: ${topCotiza}`);
    
    // Replace COTIZA top with CONOCE top
    layers[cotizaLayerIndex] = layers[cotizaLayerIndex].replace(`data-desktopportraittop="${topCotiza}"`, `data-desktopportraittop="${topConoce}"`);
    
    html = layers.join('class="n2-ss-layer');
    fs.writeFileSync(indexFile, html, 'utf8');
    console.log('Fixed button alignment!');
  } else {
    console.log('Could not find data-desktopportraittop in one of the layers.');
  }
} else {
  console.log('Could not find both layers.');
}
