const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(content);

console.log("=== MAIN HOMEPAGE SLIDER (n2-ss-17) SLIDES HIDING ATTRIBUTES ===");
$('#n2-ss-17 .n2-ss-slide').each((i, el) => {
  const dataId = $(el).attr('data-id');
  console.log(`\nSlide ${i + 1} (data-id=${dataId}):`);
  console.log(`  data-hide-desktopportrait:`, $(el).attr('data-hide-desktopportrait'));
  console.log(`  data-hide-tabletportrait:`, $(el).attr('data-hide-tabletportrait'));
  console.log(`  data-hide-mobileportrait:`, $(el).attr('data-hide-mobileportrait'));
});
