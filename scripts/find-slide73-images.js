const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Find slide 73 and slide 88 boundaries
const slide73Start = html.indexOf('data-id="73" data-slide-public-id="2"');
const slide88Start = html.indexOf('data-id="88" data-slide-public-id="1"');

console.log("Slide 73 (COTIZA) starts at:", slide73Start);
console.log("Slide 88 (CONOCE) starts at:", slide88Start);

// Slide 73 is the MOBILE/TABLET slide (comes first in HTML based on public-id="2")
// Slide 88 is the DESKTOP slide (public-id="1", marked as active)

// Get both slide contents
const slide73Html = html.substring(slide73Start, slide88Start);
const imgsSl73 = slide73Html.match(/src="[^"]*"/g) || [];
const srcsetsSl73 = slide73Html.match(/srcset="[^"]*"/g) || [];

console.log("\nSlide 73 images (src):");
imgsSl73.forEach(s => console.log(" ", s));
console.log("\nSlide 73 srcsets:");
srcsetsSl73.forEach(s => console.log(" ", s));

// Also check what layers/images slide 73 has with the COTIZA button
const cotizaIdx = slide73Html.indexOf('COTIZA');
if (cotizaIdx !== -1) {
  console.log("\nCOTIZA button context in slide 73:");
  console.log(slide73Html.substring(Math.max(0, cotizaIdx - 200), cotizaIdx + 300));
}

// Find Venezuela map image layer in slide 73
const mapImageLayer = slide73Html.indexOf('venezuela-map') !== -1 || slide73Html.indexOf('mapa') !== -1;
console.log("\nSlide 73 has Venezuela map layer:", mapImageLayer);
if (slide73Html.indexOf('mapa') !== -1) {
  const mapIdx = slide73Html.indexOf('mapa');
  console.log(slide73Html.substring(Math.max(0, mapIdx - 100), mapIdx + 300));
}
if (slide73Html.indexOf('venezuela') !== -1) {
  const venIdx = slide73Html.indexOf('venezuela');
  console.log(slide73Html.substring(Math.max(0, venIdx - 100), venIdx + 300));
}
