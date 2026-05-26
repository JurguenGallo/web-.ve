const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'public', 'index.html'), 'utf8');

const searchTexts = ['Últimos Proyectos', 'Salvajina', 'nextend-arrow'];

searchTexts.forEach(text => {
  const idx = indexHtml.indexOf(text);
  if (idx !== -1) {
    console.log(`\n--- Context for "${text}" ---`);
    // Extract 500 chars before and 1000 chars after
    const start = Math.max(0, idx - 500);
    const end = Math.min(indexHtml.length, idx + 1000);
    console.log(indexHtml.substring(start, end));
  } else {
    // Try without accents
    const textNoAccent = text.replace('Ú', '&Uacute;').replace('í', '&iacute;');
    const idx2 = indexHtml.indexOf(textNoAccent);
    if (idx2 !== -1) {
      console.log(`\n--- Context for "${textNoAccent}" ---`);
      const start = Math.max(0, idx2 - 500);
      const end = Math.min(indexHtml.length, idx2 + 1000);
      console.log(indexHtml.substring(start, end));
    } else {
      console.log(`\n"${text}" not found.`);
    }
  }
});
