const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const buf = fs.readFileSync('Auditoria SEO pagina web SIM.pdf');
const doc = new PDFParse(buf);

console.log('Pages:', doc.length);
for (let i = 0; i < doc.length; i++) {
  const page = doc[i];
  console.log(`\n=== PAGE ${i+1} ===`);
  console.log(page.text || '(no text)');
}
