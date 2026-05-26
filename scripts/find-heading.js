const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');

const terms = ['Últimos Proyectos de Ingeniería', 'Nuestros Últimos', 'últimos proyectos'];
terms.forEach(term => {
  const idx = content.indexOf(term);
  if (idx !== -1) {
    const start = Math.max(0, idx - 300);
    const end = Math.min(content.length, idx + 500);
    console.log(`\n=== Found "${term}" at index ${idx} ===`);
    console.log(content.substring(start, end));
  } else {
    console.log(`\n"${term}" NOT FOUND`);
  }
});
