const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(html);

// Get slide 2 (data-id=73) full HTML
const slide2 = $('#n2-ss-17 .n2-ss-slide[data-id="73"]');
console.log("Slide 2 outerHTML (first 2000 chars):");
console.log((slide2.prop('outerHTML') || "NOT FOUND").substring(0, 2000));

// Also get the n2-ss-17 script to see how slides are initialized
const scripts = $('script:not([src])');
scripts.each((i, el) => {
  const text = $(el).text();
  if (text.includes('"n2-ss-17"') && text.includes('slides')) {
    console.log("\n=== Slider init script (first 2000 chars) ===");
    console.log(text.substring(0, 2000));
  }
});
