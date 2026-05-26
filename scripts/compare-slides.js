const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Find the Venezuela map image layer in slide 88 (desktop)
const slide88Start = html.indexOf('data-id="88" data-slide-public-id="1"');
const slide73Start = html.indexOf('data-id="73" data-slide-public-id="2"');
const slider4Start = html.indexOf('class="n2-ss-slider-4', slide88Start);

// Slide 88 content
const slide88Html = html.substring(slide88Start, slide73Start);
// Slide 73 content
const slide73Html = html.substring(slide73Start, slider4Start);

// Search for the Venezuela map image in slide 88
const venMapIdx88 = slide88Html.indexOf('venezuela');
const venMapIdx73 = slide73Html.indexOf('venezuela');

console.log("Venezuela reference in slide 88:", venMapIdx88 !== -1 ? "FOUND at " + venMapIdx88 : "NOT FOUND");
console.log("Venezuela reference in slide 73:", venMapIdx73 !== -1 ? "FOUND at " + venMapIdx73 : "NOT FOUND");

if (venMapIdx88 !== -1) {
  const start = Math.max(0, venMapIdx88 - 200);
  const end = Math.min(slide88Html.length, venMapIdx88 + 400);
  console.log("\nSlide 88 Venezuela context:");
  console.log(slide88Html.substring(start, end));
}

if (venMapIdx73 !== -1) {
  const start = Math.max(0, venMapIdx73 - 200);
  const end = Math.min(slide73Html.length, venMapIdx73 + 400);
  console.log("\nSlide 73 Venezuela context:");
  console.log(slide73Html.substring(start, end));
}

// Check what images/layers are in slide 88 that are NOT in slide 73
const imgs88 = [...slide88Html.matchAll(/src="([^"]*)"/g)].map(m => m[1]).filter(s => !s.startsWith('data:'));
const imgs73 = [...slide73Html.matchAll(/src="([^"]*)"/g)].map(m => m[1]).filter(s => !s.startsWith('data:'));

console.log("\nImages ONLY in slide 88:", imgs88.filter(i => !imgs73.includes(i)));
console.log("\nImages ONLY in slide 73:", imgs73.filter(i => !imgs88.includes(i)));
