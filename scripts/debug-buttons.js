const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

const t1 = html.indexOf('CONOCE');
if (t1 !== -1) {
  console.log('-- CONOCE --');
  console.log(html.substring(Math.max(0, t1 - 300), t1 + 100));
}

const t2 = html.indexOf('COTIZA');
if (t2 !== -1) {
  console.log('\n-- COTIZA --');
  console.log(html.substring(Math.max(0, t2 - 300), t2 + 100));
}
