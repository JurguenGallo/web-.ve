const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');

const target = 'data-ssid="6"';
const idx = content.indexOf(target);
if (idx !== -1) {
  // Let's print 4000 characters from target to find where it finishes
  console.log(content.substring(idx - 200, idx + 4000));
} else {
  console.log("Could not find data-ssid=\"6\"");
}
