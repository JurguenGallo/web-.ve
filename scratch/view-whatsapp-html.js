const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

const target = '<style id="ht-ctc-s7_1">';
const start = html.indexOf(target);
if (start !== -1) {
  console.log(html.substring(start, start + 1000));
} else {
  console.log("Could not find style tag");
}
