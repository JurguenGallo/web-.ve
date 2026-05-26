const fs = require('fs');
const { execSync } = require('child_process');

function getImages(html) {
  const bgSection = html.match(/class="n2-ss-slide-backgrounds[^>]*>([\s\S]*?)class="n2-ss-slider-4/);
  if (bgSection) {
    const matches = [...bgSection[1].matchAll(/<img[^>]+src="([^"]+)"/g)];
    return matches.map(m => m[1]);
  }
  return null;
}

const currentHtml = fs.readFileSync('frontend/public/index.html', 'utf8');
console.log('Current images:', getImages(currentHtml));

try {
  const oldHtml = execSync('git show b891596~1:frontend/public/index.html', {encoding: 'utf8'});
  console.log('Old images (b891596~1):', getImages(oldHtml));
} catch(e) {
  console.log('Error git show');
}
