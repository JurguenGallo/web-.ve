const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(html);

console.log("=== HERO SLIDER (n2-ss-17) SLIDES ===");
$('#n2-ss-17 .n2-ss-slide').each((i, el) => {
  const dataId = $(el).attr('data-id');
  const bg = $(`#n2-ss-17 .n2-ss-slide-background[data-public-id="${$(el).attr('data-slide-public-id') || (i+1)}"]`);
  const bgImg = $(el).closest('.n2-ss-slider-3').find(`.n2-ss-slide-backgrounds .n2-ss-slide-background`).eq(i).find('img').attr('src');
  console.log(`Slide ${i+1} (data-id=${dataId}):`);
  console.log(`  background img: ${bgImg || 'NOT FOUND'}`);
});

console.log("\n=== BACKGROUNDS in n2-ss-17 ===");
$('#n2-ss-17 .n2-ss-slide-backgrounds .n2-ss-slide-background').each((i, el) => {
  const pubId = $(el).attr('data-public-id');
  const img = $(el).find('img').attr('src');
  console.log(`  Background ${i+1} (public-id=${pubId}): ${img}`);
});

// Check if portada-venezuela.png file actually exists
const venezuelaFile = path.join(__dirname, '..', 'frontend', 'public', 'wp-content', 'uploads', '2025', '03', 'portada-venezuela.png');
console.log(`\nportada-venezuela.png exists: ${fs.existsSync(venezuelaFile)}`);
