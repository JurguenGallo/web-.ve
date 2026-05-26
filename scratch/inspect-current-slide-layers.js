const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(content);

console.log("=== CURRENT SLIDE 1 (data-id=88) FULL HTML ===");
console.log($('#n2-ss-17 .n2-ss-slide[data-id="88"]').html());

console.log("\n=== CURRENT SLIDE 2 (data-id=73) FULL HTML ===");
console.log($('#n2-ss-17 .n2-ss-slide[data-id="73"]').html());
