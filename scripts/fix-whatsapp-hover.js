const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..', 'frontend', 'public');

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

const oldHoverBgColor = '#224982';
const newHoverBgColor = '#20ba5a'; // Slightly darker WhatsApp green for hover effect (normal is #25d366)

htmlFiles.forEach(relPath => {
  const fullPath = path.join(SITE_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${relPath}`);
    return;
  }

  let html = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // Let's replace the hover background color in the inline style for the click-to-chat button
  if (html.includes(oldHoverBgColor)) {
    // Specifically search for the click-to-chat hover color replacement
    const targetString = `background-color:${oldHoverBgColor}!important`;
    const targetReplacement = `background-color:${newHoverBgColor}!important`;
    
    if (html.includes(targetString)) {
      html = html.split(targetString).join(targetReplacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, html, 'utf8');
    console.log(`✓ Updated WhatsApp hover color in: ${relPath}`);
  } else {
    console.log(`- No WhatsApp hover color changes needed in: ${relPath}`);
  }
});
