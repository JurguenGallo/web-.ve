const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(content);

// Let's find elements containing data-title="Siemens-S.A.-1"
const siemensSlide = $('[data-title="Siemens-S.A.-1"]');
console.log("Found Siemens slide:", siemensSlide.length);

if (siemensSlide.length > 0) {
  // Let's traverse up to find the main slider div
  let current = siemensSlide;
  for (let i = 0; i < 10; i++) {
    const parent = current.parent();
    console.log(`Parent ${i + 1}: tag=${parent.get(0).tagName}, class=${parent.attr('class')}, id=${parent.attr('id')}`);
    if (parent.attr('id') && parent.attr('id').startsWith('n2-ss-')) {
      console.log(`FOUND MAIN SLIDER DIV: id=${parent.attr('id')}`);
      // Let's see the outer HTML of the topmost wrapper (usually n2-ss-X-align)
      const wrapper = parent.parent();
      console.log(`Wrapper: tag=${wrapper.get(0).tagName}, class=${wrapper.attr('class')}, id=${wrapper.attr('id')}`);
      break;
    }
    current = parent;
  }
}
