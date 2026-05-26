const fs = require('fs');
const path = require('path');

// 1. Update "17 años" -> "18 años" in quienes-somos
let file = path.join(__dirname, 'frontend', 'public', 'quienes-somos', 'index.html');
let content = fs.readFileSync(file, 'utf8');

content = content.replace('17 años de trayectoria', '18 años de trayectoria');

// Also update the address text to stand alone more
const oldText = 'Nuestra oficina en Venezuela está ubicada en la <strong>Oficina signada con el número 71, piso 7 del edificio Torre Sofitasa, Séptima Avenida, Esquina Calle 10, Parroquia San Juan Bautista, San Cristóbal, Estado Táchira</strong>. Siempre fieles a nuestros orígenes de excelencia y compromiso.';
const newText = 'Nuestra oficina en Venezuela está ubicada en la <strong>Oficina signada con el número 71, piso 7 del edificio Torre Sofitasa, Séptima Avenida, Esquina Calle 10, Parroquia San Juan Bautista, San Cristóbal, Estado Táchira</strong>. Siempre fieles a nuestros orígenes de excelencia y compromiso.</p><p style="margin-top:15px;font-weight:bold">📍 Oficina Venezuela: Oficina N° 71, Piso 7, Torre Sofitasa, 7ma Avenida c/c Calle 10, San Cristóbal, Táchira';

// Check if oldText exists
if (content.includes(oldText)) {
  content = content.replace(oldText, newText);
  console.log('✓ Dirección actualizada');
} else {
  console.log('✗ No se encontró el texto de dirección');
}

fs.writeFileSync(file, content, 'utf8');
console.log('✓ quienes-somos/index.html actualizado');

// 2. Update footer contact info across ALL pages
const pages = [
  'index.html',
  'contacto/index.html',
  'quienes-somos/index.html',
  'solucionesfotovoltaicas/index.html',
  'alquilerequiposelectricos/index.html',
  'galeria/index.html',
  'energia-renovables/index.html',
  'trabaja-con-nosotros/index.html',
];

for (const page of pages) {
  const pagePath = path.join(__dirname, 'frontend', 'public', page);
  let pageContent = fs.readFileSync(pagePath, 'utf8');
  
  // Update email: gerencia@simenergy.com.ve -> gerencia@simenergy.com
  if (pageContent.includes('gerencia@simenergy.com.ve')) {
    pageContent = pageContent.replace('gerencia@simenergy.com.ve', 'gerencia@simenergy.com');
    console.log(`✓ Email actualizado en ${page}`);
  }
  
  // Update phone if needed
  if (pageContent.includes('(607) 500 9440')) {
    // Add address below the existing contact info
    // We need to find the right insertion point
    console.log(`✓ Teléfono encontrado en ${page} (sin cambios)`);
  }
  
  fs.writeFileSync(pagePath, pageContent, 'utf8');
}

console.log('¡Listo!');
