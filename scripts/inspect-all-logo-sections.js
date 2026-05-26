const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');

function inspectDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      inspectDir(fullPath);
    } else if (file === 'index.html') {
      const html = fs.readFileSync(fullPath, 'utf8');
      const $ = cheerio.load(html);
      const hasSiemens = html.includes('Siemens-S.A.-10.png');
      if (hasSiemens) {
        // Let's find what element contains n2-ss-6 or data-ssid="6"
        const slider = $('[data-ssid="6"], #n2-ss-6, .et_pb_section_3');
        console.log(`${fullPath.replace(publicDir, '')}:`);
        console.log(`  - has n2-ss-6/data-ssid="6": ${$('[data-ssid="6"], #n2-ss-6').length > 0}`);
        console.log(`  - has .et_pb_section_3: ${$('.et_pb_section_3').length > 0}`);
      }
    }
  }
}

inspectDir(publicDir);
