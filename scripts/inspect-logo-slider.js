const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(content);

const sliderAlign = $('#n2-ss-6-align');
console.log("Slider align wrapper found:", sliderAlign.length);

const images = $('#n2-ss-6 img');
console.log(`Found ${images.length} images in slider #n2-ss-6:`);
images.each((i, el) => {
  console.log(`Image ${i + 1}: src=${$(el).attr('src')}, alt=${$(el).attr('alt')}`);
});
