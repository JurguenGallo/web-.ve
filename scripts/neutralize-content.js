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

  // Apply correct size, margin-top and wrapping styles to contact/index.html header
  const targetHeader = '<h1 style="text-align: center; font-size: clamp(1.8rem, 4.2vw, 3.5rem); letter-spacing: -1px; line-height: 1.2; margin-top: clamp(20px, 6vw, 80px); margin-bottom: 10px;">¡CON PRESENCIA <br><span style="color:#fcc92f; white-space: nowrap;">INTERNACIONAL!</span></h1>';
  if (html.includes('¡CON PRESENCIA') && (!html.includes('margin-top: clamp(20px') || html.includes('margin-bottom: clamp(15px'))) {
    html = html.replace(/<h1[^>]*>¡CON PRESENCIA.*?<\/h1>/gi, targetHeader);
    changed = true;
  }

  // Adjust inner row padding and margins in contacto to close the vertical gap
  if (html.includes('<div class="et_pb_row_inner et_pb_row_inner_0">') && !html.includes('et_pb_row_inner_0" style="padding-bottom: 0px')) {
    html = html.replace(
      '<div class="et_pb_row_inner et_pb_row_inner_0">',
      '<div class="et_pb_row_inner et_pb_row_inner_0" style="padding-bottom: 0px !important; margin-bottom: 0px !important;">'
    );
    changed = true;
  }
  if (html.includes('<div class="et_pb_row_inner et_pb_row_inner_1 et_animated et_pb_gutters1">') && !html.includes('margin-top: -50px')) {
    html = html.replace(
      '<div class="et_pb_row_inner et_pb_row_inner_1 et_animated et_pb_gutters1">',
      '<div class="et_pb_row_inner et_pb_row_inner_1 et_animated et_pb_gutters1" style="padding-top: 0px !important; margin-top: -50px !important;">'
    );
    changed = true;
  } else if (html.includes('margin-top: 0px !important;')) {
    html = html.replace('margin-top: 0px !important;', 'margin-top: -50px !important;');
    changed = true;
  }

  // Clear padding/margin on column_inner_0 and text_5 to close the gap
  const targetCol = '<div class="et_pb_column et_pb_column_4_4 et_pb_column_inner et_pb_column_inner_0 et-last-child">';
  if (html.includes(targetCol) && !html.includes('et_pb_column_inner_0 et-last-child" style=')) {
    html = html.replace(
      targetCol,
      '<div class="et_pb_column et_pb_column_4_4 et_pb_column_inner et_pb_column_inner_0 et-last-child" style="margin-bottom: 0px !important; padding-bottom: 0px !important;">'
    );
    changed = true;
  }

  const targetText = '<div class="et_pb_module et_pb_text et_pb_text_5 et_pb_text_align_left et_pb_bg_layout_light">';
  if (html.includes(targetText) && !html.includes('et_pb_text_5 et_pb_text_align_left et_pb_bg_layout_light" style=')) {
    html = html.replace(
      targetText,
      '<div class="et_pb_module et_pb_text et_pb_text_5 et_pb_text_align_left et_pb_bg_layout_light" style="margin-bottom: 0px !important; padding-bottom: 0px !important;">'
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
