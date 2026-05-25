const fs = require('fs');
const path = require('path');

const SITE = path.join(__dirname, '..', 'frontend', 'public');

const htmlFiles = [
  'index.html',
  'quienes-somos/index.html',
  'solucionesfotovoltaicas/index.html',
  'alquilerequiposelectricos/index.html',
  'galeria/index.html',
  'contacto/index.html',
  'trabaja-con-nosotros/index.html',
  'energia-renovables/index.html',
];

let totalChanges = 0;

htmlFiles.forEach(relPath => {
  const fullPath = path.join(SITE, relPath);
  if (!fs.existsSync(fullPath)) return;

  let html = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // 1. Replace contact page headline
  if (html.includes('¡PRESENTES EN VARIAS CIUDADES DE <span style="color: #fcc92f;">COLOMBIA</span>!')) {
    html = html.replace(
      '¡PRESENTES EN VARIAS CIUDADES DE <span style="color: #fcc92f;">COLOMBIA</span>!',
      '¡CON PRESENCIA <span style="color: #fcc92f;">INTERNACIONAL</span>!'
    );
    changed = true;
  }

  // 2. Hide Colombia map image in contact page
  if (html.includes('colombia-sim.png') && !html.includes('display:none;')) {
    // Replace the picture tag containing the colombia map with a hidden version
    // A simple way is to find the picture tag around the colombia-sim.png and hide its wrapper or image
    html = html.replace(/<picture[^>]*>\s*<source[^>]*colombia-sim\.png\.webp[^>]*>\s*<img[^>]*colombia-sim\.png[^>]*>\s*<\/picture>/gi, match => {
       return `<div style="display:none;">${match}</div>`;
    });
    // In case the structure is different, add display none directly to the img
    html = html.replace(/(<img[^>]*src="[^"]*colombia-sim\.png"[^>]*)>/gi, '$1 style="display:none;">');
    changed = true;
  }

  // 3. Update the footer address
  const footerAddressOld = 'Avenida 18 #18-29 La Libertad, Cúcuta - Norte de santander (Colombia)';
  const footerAddressNew = 'Operaciones en Venezuela - Sede origen en Colombia';
  if (html.includes(footerAddressOld)) {
    html = html.replaceAll(footerAddressOld, footerAddressNew);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, html);
    console.log(`  Neutralized: ${relPath}`);
    totalChanges++;
  }
});

console.log(`\nNeutralization complete! Applied changes to ${totalChanges} file(s).`);
