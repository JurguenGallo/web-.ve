const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'public', 'contacto', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Replace all colombia-sim references with venezuela-sim
html = html.split('colombia-sim.png.webp').join('venezuela-sim.png.webp');
html = html.split('colombia-sim-480x645.png.webp').join('venezuela-sim-480x645.png.webp');
html = html.split('colombia-sim-480x645.png').join('venezuela-sim-480x645.png');
html = html.split('colombia-sim.png').join('venezuela-sim.png');

// 2. Remove display:none from the map img — simple string replace approach
//    The minified HTML has: style="display:none;" on the img tag for the map
html = html.split(' style="display:none;"').join('');

// 3. Fix alt text
html = html.split('Mapa de Colombia con presencia SIM Energy').join('Mapa de Venezuela con presencia SIM Energy');

fs.writeFileSync(filePath, html, 'utf8');

// Verify
const hasVenezuela = html.includes('venezuela-sim.png');
const hasColombia  = html.includes('colombia-sim.png');
console.log('✓ contacto/index.html actualizado');
console.log('  venezuela-sim.png presente:', hasVenezuela);
console.log('  colombia-sim.png eliminado:', !hasColombia);
