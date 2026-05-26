const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');
const $ = cheerio.load(content);

console.log("Searching for slider wrappers...");
$('[id^="n2-ss-"]').each((i, el) => {
  const id = $(el).attr('id');
  const slides = $(el).find('.n2-ss-slide');
  const bgImg = $(el).find('.n2-ss-slide-background img');
  console.log(`Slider ${i + 1}: ID=${id}, Slides count=${slides.length}, Backgrounds count=${bgImg.length}`);
  bgImg.each((j, imgEl) => {
    console.log(`  Bg ${j + 1}: ${$(imgEl).attr('src')}`);
  });
});
