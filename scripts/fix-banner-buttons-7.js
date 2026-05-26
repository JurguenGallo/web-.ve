const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const classConoce = 'n-uc-v4jKxhYiQXlh';
const classCotiza = 'n-uc-li3T5Vbe5XvC';

if (html.includes(classCotiza)) {
  html = html.split(classCotiza).join(classConoce);
  fs.writeFileSync(indexFile, html, 'utf8');
  console.log('Unificadas las clases de ambos botones exitosamente.');
} else {
  console.log('No se pudo encontrar la clase del botón COTIZA.');
}
