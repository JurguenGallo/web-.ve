const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');
const $ = cheerio.load(content);

console.log("=== BACKGROUNDS ===");
$('.n2-ss-slide-backgrounds > div').each((i, el) => {
  const pubId = $(el).attr('data-public-id');
  const img = $(el).find('img').attr('src');
  console.log(`Bg ${i}: data-public-id=${pubId}, img=${img}`);
});

console.log("\n=== SLIDES ===");
$('.n2-ss-slider-4 > div').each((i, el) => {
  const slideId = $(el).attr('data-id');
  const classes = $(el).attr('class');
  console.log(`Slide ${i}: data-id=${slideId}, class=${classes}`);
});
