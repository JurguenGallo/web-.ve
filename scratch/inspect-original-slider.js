const { execSync } = require('child_process');
const cheerio = require('cheerio');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const originalHtml = execSync('git show 7a37fa0:frontend/public/index.html', { cwd: rootDir, encoding: 'utf8' });
const $ = cheerio.load(originalHtml);

console.log("=== ORIGINAL MAIN HOMEPAGE SLIDER (n2-ss-17) SLIDES ===");
$('#n2-ss-17 .n2-ss-slide').each((i, el) => {
  const dataId = $(el).attr('data-id');
  const slidePublicId = $(el).attr('data-slide-public-id');
  console.log(`\nSlide ${i + 1} (data-id=${dataId}, data-slide-public-id=${slidePublicId}):`);
  
  // Let's print out all texts/headings inside this slide
  const headings = [];
  $(el).find('h1, h2, h3, h4, h5, h6, div, p').each((j, textEl) => {
    const text = $(textEl).text().trim();
    if (text && text.length > 0 && !$(textEl).children().length) {
      headings.push(`${textEl.tagName}: "${text}"`);
    }
  });
  console.log("  Texts:", headings.slice(0, 10));
  
  // Let's print out any buttons
  const buttons = [];
  $(el).find('a').each((j, aEl) => {
    buttons.push(`a href="${$(aEl).attr('href')}": "${$(aEl).text().trim()}"`);
  });
  console.log("  Buttons:", buttons);
});

console.log("\n=== ORIGINAL BACKGROUNDS ===");
$('#n2-ss-17 .n2-ss-slide-backgrounds .n2-ss-slide-background').each((i, el) => {
  const pubId = $(el).attr('data-public-id');
  const img = $(el).find('img').attr('src');
  console.log(`  Background ${i+1} (public-id=${pubId}): ${img}`);
});
