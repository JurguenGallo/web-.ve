const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'sitio-estatico', 'www.simenergy.com.co', 'index.html');
const html = fs.readFileSync(file, 'utf8');

console.log('=== VERIFICACION DE FIXES SEO ===\n');

// H1s
const h1s = html.match(/<h1[^>]*>[^<]*<\/h1>/g);
console.log('H1s encontrados:', h1s.length);
h1s.forEach((h, i) => console.log(`  ${i+1}. ${h.replace(/<[^>]+>/g, '')}`));

// Images without alt
const imgs = html.match(/<img[^>]*>/g) || [];
let withoutAlt = 0;
for (const img of imgs) {
  if (!/alt\s*=\s*["']/.test(img)) withoutAlt++;
}
console.log(`\nImagenes sin alt: ${withoutAlt}/${imgs.length}`);

// Viewport
const vp = html.match(/<meta name="viewport"[^>]*>/);
console.log('\nViewport:', vp ? vp[0] : 'NOT FOUND');

// og:image
const og = html.match(/<meta property="og:image"[^>]*>/);
console.log('og:image:', og ? og[0] : 'NOT FOUND');

// twitter:image
const tw = html.match(/<meta name="twitter:image"[^>]*>/);
console.log('twitter:image:', tw ? tw[0] : 'NOT FOUND');

// Schema
const ld = html.match(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g);
console.log(`\nSchema JSON-LD encontrados: ${ld ? ld.length : 0}`);

// Title
const title = html.match(/<title>([^<]*)<\/title>/);
console.log('\nTitle:', title ? title[1] : 'NOT FOUND');

// Meta description
const desc = html.match(/<meta name="description"[^>]*>/);
console.log('Meta description:', desc ? desc[0] : 'NOT FOUND');

// og:title
const ogt = html.match(/<meta property="og:title"[^>]*>/);
console.log('og:title:', ogt ? ogt[0] : 'NOT FOUND');
