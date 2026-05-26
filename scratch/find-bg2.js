const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

const bg2Start = html.indexOf('data-public-id="2"');
if (bg2Start !== -1) {
  console.log("Found data-public-id=\"2\" at:", bg2Start);
  console.log(html.substring(bg2Start - 100, bg2Start + 400));
} else {
  console.log("Could not find data-public-id=\"2\"");
}
