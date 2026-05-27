const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PUBLIC = path.join(__dirname, '..', 'frontend', 'public');

const FORMSPREE_PLACEHOLDER = 'https://formspree.io/f/xxxxxxx'; // user must replace

// Pages with forms
const FORM_PAGES = [
  { file: 'quienes-somos/index.html', emailSubject: 'Contacto - Quiénes Somos' },
  { file: 'solucionesfotovoltaicas/index.html', emailSubject: 'Contacto - Soluciones Fotovoltaicas' },
  { file: 'galeria/index.html', emailSubject: 'Contacto - Galería' },
  { file: 'contacto/index.html', emailSubject: 'Contacto - SIM Energy' },
  { file: 'energia-renovables/index.html', emailSubject: 'Contacto - Energías Renovables' },
];

// ── #5 Reemplazar formularios WPForms con Formspree ──
console.log('\n📌 #5 Reemplazando formularios WPForms...');

FORM_PAGES.forEach(({ file, emailSubject }) => {
  const fp = path.join(PUBLIC, file);
  let html = fs.readFileSync(fp, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });

  // Find the Divi contact form module
  const formContainer = $('.et_pb_contact_form_container');
  if (!formContainer.length) {
    console.log(`  ❌ No form found in ${file}`);
    return;
  }

  // Extract fields
  const fields = [];
  formContainer.find('.et_pb_contact_field').each((i, el) => {
    const $el = $(el);
    const type = $el.data('type') || 'input';
    const id = $el.data('id') || '';
    const placeholder = $el.find('input, textarea').attr('placeholder') || '';
    const isHalf = $el.hasClass('et_pb_contact_field_half');
    fields.push({ id, type, placeholder, half: isHalf });
  });

  // Build new Formspree form
  let formHtml = `<form action="${FORMSPREE_PLACEHOLDER}" method="POST" style="max-width:600px;margin:0 auto">
    <input type="hidden" name="_subject" value="${emailSubject}">`;

  fields.forEach(f => {
    const widthStyle = f.half ? 'style="width:48%;display:inline-block"' : 'style="width:100%"';
    formHtml += `<div ${widthStyle}>
      <label for="${f.id}" style="display:block;margin-bottom:4px;font-weight:600;color:#224982">${f.placeholder}</label>`;

    if (f.type === 'email') {
      formHtml += `<input type="email" name="${f.id}" id="${f.id}" placeholder="${f.placeholder}" required style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:14px;margin-bottom:12px">`;
    } else if (f.type === 'text' || f.type === 'textarea') {
      formHtml += `<textarea name="${f.id}" id="${f.id}" placeholder="${f.placeholder}" rows="4" required style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:14px;margin-bottom:12px"></textarea>`;
    } else {
      formHtml += `<input type="text" name="${f.id}" id="${f.id}" placeholder="${f.placeholder}" required style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;font-size:14px;margin-bottom:12px">`;
    }
    formHtml += `</div>`;
  });

  formHtml += `<div style="text-align:center">
    <button type="submit" style="background-color:#224982;color:#fff;padding:14px 40px;border:none;border-radius:50px;font-size:18px;font-weight:700;cursor:pointer">Enviar mensaje</button>
  </div>
</form>
<p style="text-align:center;font-size:12px;color:#999;margin-top:10px">🔒 Tus datos están seguros. No compartimos tu información.</p>`;

  // Replace the entire form container
  formContainer.replaceWith(formHtml);

  // Also remove any inline Divi form scripts if they exist
  $('script').each((i, el) => {
    const text = $(el).html() || '';
    if (text.includes('et_pb_contact_form') || text.includes('et_contact_proccess')) {
      $(el).remove();
    }
  });

  // Remove et_pb_contact_form related hidden inputs
  $('input[name="_wpnonce-et-pb-contact-form-submitted-0"]').remove();
  $('input[name="_wp_http_referer"]').remove();

  fs.writeFileSync(fp, $.html(), 'utf-8');
  console.log(`  ✅ ${file}: form replaced with Formspree`);
});

// ── #7 Agregar loading="lazy" a imágenes ──
console.log('\n📌 #7 Agregando loading="lazy" a imágenes...');

const htmlFiles = fs.readdirSync(PUBLIC, { recursive: true }).filter(f => f.endsWith('.html'));
let totalImgs = 0;
let lazyAdded = 0;

htmlFiles.forEach(f => {
  const fp = path.join(PUBLIC, f);
  let html = fs.readFileSync(fp, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });

  $('img').each((i, el) => {
    const $img = $(el);
    totalImgs++;
    // Don't add lazy to logo or tiny icons
    const src = $img.attr('src') || '';
    if (!src.includes('logo') && !$img.attr('loading')) {
      $img.attr('loading', 'lazy');
      lazyAdded++;
    }
  });

  fs.writeFileSync(fp, $.html(), 'utf-8');
});

console.log(`  ✅ ${lazyAdded}/${totalImgs} imágenes con loading="lazy"`);

// ── #6 Crear blog básico ──
console.log('\n📌 #6 Creando estructura de blog...');

const blogDir = path.join(PUBLIC, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

const blogHTML = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Blog | SIM Energy Venezuela</title><meta name="description" content="Artículos y noticias sobre energía solar, ingeniería eléctrica y proyectos de SIM Energy en Venezuela."><meta property="og:title" content="Blog | SIM Energy Venezuela"><meta property="og:description" content="Artículos sobre energía solar, ingeniería eléctrica y proyectos en Venezuela."><meta property="og:image" content="/wp-content/uploads/2025/02/logo-sim2025.png"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Blog | SIM Energy Venezuela"><meta name="twitter:description" content="Artículos sobre energía solar, ingeniería eléctrica y proyectos en Venezuela."><meta name="twitter:image" content="/wp-content/uploads/2025/02/logo-sim2025.png"><link rel="canonical" href="https://www.simenergy.com.ve/blog/"><link rel="icon" href="/wp-content/uploads/2021/05/cropped-favicon-1-32x32.png"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Montserrat,Helvetica,Arial,sans-serif;color:#333;background:#f8f9fa}
header{background:#224982;color:#fff;padding:20px 0;text-align:center}
header h1{font-size:28px;margin-bottom:4px}
header p{font-size:14px;opacity:.8}
nav{background:#fcc92f;padding:10px 0;text-align:center}
nav a{color:#224982;text-decoration:none;font-weight:600;margin:0 15px;font-size:14px}
nav a:hover{text-decoration:underline}
.container{max-width:900px;margin:30px auto;padding:0 20px}
.post{background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.post h2{color:#224982;font-size:20px;margin-bottom:8px}
.post .meta{font-size:12px;color:#999;margin-bottom:12px}
.post p{font-size:14px;line-height:1.7;color:#555}
.post .btn{display:inline-block;margin-top:12px;background:#224982;color:#fff;padding:8px 20px;border-radius:50px;text-decoration:none;font-size:13px;font-weight:600}
.coming-soon{text-align:center;padding:60px 20px;color:#999}
.coming-soon h2{font-size:24px;color:#224982;margin-bottom:10px}
footer{background:#224982;color:#fff;text-align:center;padding:20px;font-size:13px;margin-top:40px}
</style></head><body>
<header><h1>Blog SIM Energy</h1><p>Energía solar, ingeniería eléctrica y sostenibilidad en Venezuela</p></header>
<nav><a href="/">Inicio</a><a href="/blog/">Blog</a><a href="/quienes-somos/">Quiénes somos</a><a href="/contacto/">Contacto</a></nav>
<div class="container">
<div class="coming-soon">
<h2>Próximamente</h2>
<p>Estamos preparando contenido sobre energía solar, eficiencia energética y nuestros proyectos en Venezuela.</p>
<p style="margin-top:20px;font-size:13px">Mientras tanto, visítanos en <a href="/" style="color:#224982">simenergy.com.ve</a></p>
</div>
</div>
<footer><p>COPYRIGHT 2026 © TODOS LOS DERECHOS RESERVADOS SIM</p></footer>
</body></html>`;

fs.writeFileSync(path.join(blogDir, 'index.html'), blogHTML);
console.log('  ✅ Blog creado en /blog/ (coming soon)');

// ── #10 Mobile fixes: check viewport issues ──
console.log('\n📌 #10 Verificando meta viewport...');
htmlFiles.forEach(f => {
  const fp = path.join(PUBLIC, f);
  let html = fs.readFileSync(fp, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });

  let changed = false;
  const vp = $('meta[name="viewport"]');
  if (vp.length) {
    const content = vp.attr('content') || '';
    if (content.includes('user-scalable=0') || content.includes('user-scalable=no')) {
      vp.attr('content', 'width=device-width, initial-scale=1');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fp, $.html(), 'utf-8');
    console.log(`  ✅ ${f}: viewport fixed`);
  }
});

// ── Re-minify HTML ──
console.log('\n📦 Re-minificando HTML...');
htmlFiles.forEach(f => {
  const fp = path.join(PUBLIC, f);
  let content = fs.readFileSync(fp, 'utf-8');
  content = content.replace(/>\s+</g, '><');
  content = content.replace(/^\s+|\s+$/gm, '');
  content = content.replace(/  +/g, ' ');
  content = content.replace(/\n\s*\n/g, '\n');
  fs.writeFileSync(fp, content, 'utf-8');
});
console.log('  ✅ HTML minificados');

console.log('\n✅ Todas las correcciones aplicadas!\n');
console.log('⚠️  Pendiente del usuario:');
console.log('  - #4: Número real de WhatsApp');
console.log('  - #9: ID de Google Analytics (GA4)');
console.log('  - Reemplazar FORMSPREE_PLACEHOLDER en scripts/fix-recommendations.js');
console.log('    por el endpoint real de https://formspree.io');
