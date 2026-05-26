const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(html);

// Get the full outer HTML of background 2 in the hero slider
const bg2 = $('#n2-ss-17 .n2-ss-slide-backgrounds .n2-ss-slide-background[data-public-id="2"]');
console.log("Background 2 HTML:");
console.log(bg2.prop('outerHTML') || "NOT FOUND");

// Also check the full preload link for the images
const preloads = $('link[rel="preload"][as="image"]');
console.log("\nImage preload links:");
preloads.each((i, el) => {
  console.log(`  ${$(el).attr('href')} [${$(el).attr('media')}]`);
});
