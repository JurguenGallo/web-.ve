const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');
const $ = cheerio.load(content);

$('#n2-ss-17 [data-hide-desktopportrait], #n2-ss-17 [data-hide-tabletportrait], #n2-ss-17 [data-hide-mobileportrait]').each((i, el) => {
  console.log(`Element ${i + 1}: tag=${el.tagName}, class=${$(el).attr('class')}, id=${$(el).attr('id')}`);
  console.log(`  hide-desktopportrait=${$(el).attr('data-hide-desktopportrait')}`);
  console.log(`  hide-tabletportrait=${$(el).attr('data-hide-tabletportrait')}`);
  console.log(`  hide-mobileportrait=${$(el).attr('data-hide-mobileportrait')}`);
});
