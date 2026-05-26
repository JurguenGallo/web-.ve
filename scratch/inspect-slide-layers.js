const { execSync } = require('child_process');
const cheerio = require('cheerio');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const originalHtml = execSync('git show 7a37fa0:frontend/public/index.html', { cwd: rootDir, encoding: 'utf8' });
const $ = cheerio.load(originalHtml);

console.log("=== LAYER IMAGES IN ORIGINAL SLIDES ===");
$('#n2-ss-17 .n2-ss-slide').each((i, el) => {
  const dataId = $(el).attr('data-id');
  console.log(`\nSlide ${i + 1} (data-id=${dataId}):`);
  $(el).find('img').each((j, imgEl) => {
    console.log(`  Img ${j + 1}: src="${$(imgEl).attr('src')}" class="${$(imgEl).attr('class')}" alt="${$(imgEl).attr('alt')}"`);
  });
});
