const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');
const $ = cheerio.load(content);

$('#n2-ss-17 .n2-ss-slide').each((i, el) => {
  console.log(`Slide ${i + 1}: data-id=${$(el).attr('data-id')}`);
  console.log(`  hide-desktopportrait=${$(el).attr('data-hide-desktopportrait')}`);
  console.log(`  hide-desktoplandscape=${$(el).attr('data-hide-desktoplandscape')}`);
  console.log(`  hide-tabletportrait=${$(el).attr('data-hide-tabletportrait')}`);
  console.log(`  hide-tabletlandscape=${$(el).attr('data-hide-tabletlandscape')}`);
  console.log(`  hide-mobileportrait=${$(el).attr('data-hide-mobileportrait')}`);
  console.log(`  hide-mobilelandscape=${$(el).attr('data-hide-mobilelandscape')}`);
});
