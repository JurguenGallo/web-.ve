const fs = require('fs');
const { execSync } = require('child_process');

try {
  const oldHtml = execSync('git show b891596~1:frontend/public/index.html', {encoding: 'utf8'});
  let currentHtml = fs.readFileSync('frontend/public/index.html', 'utf8');
  
  // Find the slide 2 background in old HTML
  const oldBgRegex = /(<div class="n2-ss-slide-background" data-public-id="2"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)\s*<\/div>\s*<div class="n2-ss-slider-4 n2-ow">/;
  const oldBgMatch = oldHtml.match(oldBgRegex);
  
  // Find the slide 2 background in current HTML
  const curBgRegex = /(<div class="n2-ss-slide-background" data-public-id="2"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)\s*<\/div>\s*<div class="n2-ss-slider-4 n2-ow">/;
  const curBgMatch = currentHtml.match(curBgRegex);
  
  if (oldBgMatch && curBgMatch) {
    console.log('Found both backgrounds!');
    currentHtml = currentHtml.replace(curBgMatch[1], oldBgMatch[1]);
    fs.writeFileSync('frontend/public/index.html', currentHtml);
    console.log('Successfully replaced second slide background with the original one.');
  } else {
    console.log('Could not match backgrounds:', !!oldBgMatch, !!curBgMatch);
  }
} catch(e) {
  console.log('Error:', e);
}
