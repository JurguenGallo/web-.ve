const { execSync } = require('child_process');
const path = require('path');
const cheerio = require('cheerio');

const rootDir = path.join(__dirname, '..');

// Check what slide 2 (data-id=73) had BEFORE any of our banner changes
// That was commit 7a37fa0 (optimize images, before banner change)
const originalHtml = execSync('git show 7a37fa0:frontend/public/index.html', { cwd: rootDir, encoding: 'utf8' });
const $ = cheerio.load(originalHtml);

console.log("=== ORIGINAL HERO SLIDER SLIDE 2 (data-id=73) ===");

// Find slide 73
$('#n2-ss-17 .n2-ss-slide[data-id="73"]').each((i, el) => {
  console.log(`Slide 2 (data-id=73):`);
  
  // Find its background in the backgrounds section
  const slidePublicId = $(el).attr('data-slide-public-id');
  console.log(`  data-slide-public-id: ${slidePublicId}`);
  
  // Print the full inner html
  console.log(`  inner html (truncated): ${$(el).html().substring(0, 800)}`);
});

// Check backgrounds section
console.log("\n=== ALL BACKGROUNDS IN ORIGINAL ===");
$('#n2-ss-17 .n2-ss-slide-backgrounds .n2-ss-slide-background').each((i, el) => {
  const pubId = $(el).attr('data-public-id');
  const img = $(el).find('img').attr('src');
  console.log(`  Background ${i+1} (public-id=${pubId}): ${img}`);
});
