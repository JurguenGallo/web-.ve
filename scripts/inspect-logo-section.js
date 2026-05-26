const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const $ = cheerio.load(content);

const section = $('.et_pb_section_3');
console.log("Section 3 found:", section.length);
if (section.length > 0) {
  console.log("Section 3 tag:", section.get(0).tagName);
  console.log("Section 3 classes:", section.attr('class'));
  console.log("Section 3 inner modules count:", section.find('.et_pb_module').length);
  section.find('.et_pb_module').each((i, el) => {
    console.log(`  Module ${i + 1}: tag=${el.tagName}, class=${$(el).attr('class')}`);
  });
}
