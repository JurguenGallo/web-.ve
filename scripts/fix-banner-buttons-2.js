const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

let changed = false;

// Fix Button Jump:
// The buttons are placed inside a layer. We need to find the layer's data-desktopportraittop attribute.
// Let's use a regex to match the layer containing CONOCE MÁS.
const layerRegexConoce = /<div class="n2-ss-layer[^>]*data-desktopportraittop="([^"]+)"[^>]*>(?:(?!<div class="n2-ss-layer)[\s\S])*?CONOCE MÁS/g;
const layerRegexCotiza = /<div class="n2-ss-layer[^>]*data-desktopportraittop="([^"]+)"[^>]*>(?:(?!<div class="n2-ss-layer)[\s\S])*?COTIZA AQUÍ/g;

let matchConoce = layerRegexConoce.exec(html);
let matchCotiza = layerRegexCotiza.exec(html);

if (matchConoce && matchCotiza) {
  const topConoce = matchConoce[1];
  const topCotiza = matchCotiza[1];
  console.log(`CONOCE MÁS top: ${topConoce}`);
  console.log(`COTIZA AQUÍ top: ${topCotiza}`);
  
  // Replace COTIZA's top with CONOCE's top
  if (topConoce !== topCotiza) {
    const fullCotizaMatch = matchCotiza[0];
    const newCotiza = fullCotizaMatch.replace(`data-desktopportraittop="${topCotiza}"`, `data-desktopportraittop="${topConoce}"`);
    html = html.replace(fullCotizaMatch, newCotiza);
    changed = true;
    console.log('Fixed button jump!');
  } else {
    console.log('Buttons already have the same top value.');
  }
}

// Restore Slide 2 background
// We need to find the slide that has COTIZA AQUÍ and check its background image.
// Or we can just look for the second occurrence of portada-venezuela.png
const parts = html.split('portada-venezuela.png');
if (parts.length > 2) { // meaning it occurs at least twice
  // Restore the second occurrence
  html = parts[0] + 'portada-venezuela.png' + parts[1] + 'Presentes768.png' + parts.slice(2).join('portada-venezuela.png');
  changed = true;
  console.log('Restored Slide 2 background.');
}

if (changed) {
  fs.writeFileSync(indexFile, html, 'utf8');
}
