const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');
const $ = cheerio.load(content);

console.log("Searching for script tags initializing n2-ss-17...");
$('script').each((i, el) => {
  const text = $(el).text();
  if (text.includes('n2-ss-17')) {
    console.log(`Script ${i + 1} contains n2-ss-17. Length of text: ${text.length}`);
    console.log("Preview:");
    console.log(text.substring(0, 1000));
    console.log("\n-------------------------------------------------\n");
  }
});
