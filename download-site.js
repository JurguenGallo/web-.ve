const scrape = require('website-scraper').default;
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'sitio-estatico');

console.log('Descargando https://www.simenergy.com.co ...');

scrape({
  urls: [
    { url: 'https://www.simenergy.com.co/', filename: 'index.html' }
  ],
  directory: outDir,
  recursive: true,
  maxRecursiveDepth: 5,
  urlFilter: (url) => {
    return url.startsWith('https://www.simenergy.com.co/');
  },
  filenameGenerator: 'bySiteStructure',
  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
}).then((result) => {
  console.log('Descarga completada!');
  console.log(`Archivos descargados: ${result.length}`);
  // List files
  result.forEach(r => console.log(`  ${r.filename}`));
}).catch(err => {
  console.error('Error:', err.message);
});
