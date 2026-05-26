const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// Replace both standard and mobile versions of the old banner with the new one
let changed = false;

const oldDesktop = '/wp-content/uploads/2025/03/Presentes5.png';
const oldMobile = '/wp-content/uploads/2025/03/Presentes768.png';
const newBanner = '/wp-content/uploads/2025/03/portada-venezuela.png';

if (html.includes(oldDesktop)) {
  html = html.split(oldDesktop).join(newBanner);
  changed = true;
  console.log('Replaced desktop banner.');
}

if (html.includes(oldMobile)) {
  html = html.split(oldMobile).join(newBanner);
  changed = true;
  console.log('Replaced mobile banner.');
}

if (changed) {
  fs.writeFileSync(indexFile, html, 'utf8');
  console.log('Successfully updated index.html with the new banner.');
} else {
  console.log('Could not find the old banner images in index.html.');
}
