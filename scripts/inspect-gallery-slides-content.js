const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');
const $ = cheerio.load(content);

$('#n2-ss-17 .n2-ss-slide').each((i, el) => {
  console.log(`\n=== SLIDE ${i + 1} (data-id=${$(el).attr('data-id')}) ===`);
  console.log("HTML (Truncated):");
  console.log($(el).html().substring(0, 1000));
});
