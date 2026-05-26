const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');
const $ = cheerio.load(content);

console.log("Analyzing slider elements in galeria...");
const backgrounds = $('.n2-ss-slide-background');
console.log(`Found ${backgrounds.length} slide backgrounds:`);
backgrounds.each((i, el) => {
  const pubId = $(el).attr('data-public-id');
  const img = $(el).find('img').attr('src');
  console.log(`Background ${i + 1}: public-id=${pubId}, img=${img}`);
});

const slides = $('.n2-ss-slide');
console.log(`\nFound ${slides.length} slide elements:`);
slides.each((i, el) => {
  const slideId = $(el).attr('data-id');
  console.log(`Slide ${i + 1}: data-id=${slideId}`);
});
