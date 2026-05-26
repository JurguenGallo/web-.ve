const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(content);

console.log("=== MAIN HOMEPAGE SLIDER (n2-ss-17) SLIDES ===");
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
