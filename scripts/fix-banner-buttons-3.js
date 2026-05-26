const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const $ = cheerio.load(html, { decodeEntities: false });

let topConoce = null;
let topCotiza = null;
let conoceElem = null;
let cotizaElem = null;

// Find the buttons by their text
$('div.n2-ss-layer').each((i, elem) => {
  const text = $(elem).text();
  if (text.includes('CONOCE MÁS') || text.includes('CONOCE M&Aacute;S')) {
    topConoce = $(elem).attr('data-desktopportraittop');
    conoceElem = elem;
  }
  if (text.includes('COTIZA AQUÍ') || text.includes('COTIZA AQU&Iacute;')) {
    topCotiza = $(elem).attr('data-desktopportraittop');
    cotizaElem = elem;
  }
});

if (topConoce && cotizaElem && topConoce !== topCotiza) {
  $(cotizaElem).attr('data-desktopportraittop', topConoce);
  console.log(`Fixed jump! Set COTIZA top to ${topConoce}`);
} else {
  console.log('Could not find buttons or they are already aligned.');
  console.log({ topConoce, topCotiza });
}

html = $.html();

// Restore slide 2
const parts = html.split('portada-venezuela.png');
if (parts.length > 2) {
  html = parts[0] + 'portada-venezuela.png' + parts[1] + 'Presentes768.png' + parts.slice(2).join('portada-venezuela.png');
  console.log('Restored Slide 2 background.');
}

fs.writeFileSync(indexFile, html, 'utf8');
