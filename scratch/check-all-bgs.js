const { execSync } = require('child_process');
const cheerio = require('cheerio');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const originalHtml = execSync('git show 7a37fa0:frontend/public/index.html', { cwd: rootDir, encoding: 'utf8' });
const $ = cheerio.load(originalHtml);

console.log("=== ALL ORIGINAL BACKGROUNDS ===");
$('#n2-ss-17 .n2-ss-slide-backgrounds .n2-ss-slide-background').each((i, el) => {
  console.log(`\nBackground ${i+1}:`);
  console.log($(el).html());
});
