const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'public', 'quienes-somos', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const oldText = 'empresa colombiana de ingeniería eléctrica nacida en Norte de Santander</strong>, con más de <strong>17 años de trayectoria</strong> realizando obras civiles, mantenimientos, diseños y consultorías en el sector energético e industrial. Con la gran mayoría de nuestros proyectos desarrollados en Colombia, hoy nos encontramos en un proceso de <strong>expansión internacional</strong>, llevando nuestras soluciones y servicios integrales a otros países como <strong>Venezuela</strong>, siempre fieles a nuestros orígenes de excelencia y compromiso.';

const newText = 'empresa de ingeniería eléctrica con origen en Norte de Santander, Colombia</strong>, con más de <strong>17 años de trayectoria</strong> realizando obras civiles, mantenimientos, diseños y consultorías en el sector energético e industrial. Con la gran mayoría de nuestros proyectos desarrollados en Colombia, hoy nos encontramos en un proceso de <strong>expansión internacional</strong> en <strong>Venezuela</strong>, con la meta de estar operando completamente en todo el país para <strong>2027</strong>. Nuestra oficina en Venezuela está ubicada en la <strong>Oficina signada con el número 71, piso 7 del edificio Torre Sofitasa, Séptima Avenida, Esquina Calle 10, Parroquia San Juan Bautista, San Cristóbal, Estado Táchira</strong>. Siempre fieles a nuestros orígenes de excelencia y compromiso.';

if (content.includes(oldText)) {
  content = content.replace(oldText, newText);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Texto actualizado correctamente');
} else {
  console.log('✗ No se encontró el texto original');
  // Try to find similar text
  const idx = content.indexOf('empresa colombiana');
  if (idx >= 0) {
    console.log('Texto encontrado en posición:', idx);
    console.log('Contexto:', content.substring(idx, idx + 200));
  }
}
