const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Get the right boundaries for each slide
// Slide 88 is the first active slide (public-id=1)
// Slide 73 is the second slide (public-id=2)

const slide88Start = html.indexOf('data-id="88" data-slide-public-id="1"');
const slide73Start = html.indexOf('data-id="73" data-slide-public-id="2"');

console.log("Slide 88 starts at:", slide88Start);
console.log("Slide 73 starts at:", slide73Start);

// Get slide 73 html - find its end
const slide73HtmlStart = slide73Start;
// Find next major marker after slide 73
const endMarker = html.indexOf('class="n2-ss-slider-4', slide73Start);
const slide73Html = html.substring(slide73HtmlStart, endMarker);
console.log("\nSlide 73 first 1000 chars:");
console.log(slide73Html.substring(0, 1000));

// Find any images in slide 73
const imgMatches = [...slide73Html.matchAll(/src="([^"]*)"/g)];
const srcsetMatches = [...slide73Html.matchAll(/srcset="([^"]*)"/g)];
console.log("\nImages (src):");
imgMatches.forEach(m => console.log(" ", m[1]));
console.log("\nImages (srcset):");
srcsetMatches.forEach(m => console.log(" ", m[1]));

// Does slide 73 have the Venezuela map image inside it?
// Looking for img-layer with the map
const mapLayerSearch = slide73Html.includes('mapa-venezuela') || slide73Html.includes('venezuela-map-layer') || slide73Html.includes('mapa_colombia');
console.log("\nHas map layer:", mapLayerSearch);

// Check what data-slide-public-id slide88 and slide73 have
const s88 = html.substring(slide88Start, slide88Start + 200);
const s73 = html.substring(slide73Start, slide73Start + 200);
console.log("\nSlide 88 header:", s88);
console.log("\nSlide 73 header:", s73);
