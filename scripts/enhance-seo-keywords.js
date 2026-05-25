const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SITE_DIR = path.join(__dirname, '..', 'frontend', 'public');
const indexPath = path.join(SITE_DIR, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error("No se encontro index.html");
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');
const $ = cheerio.load(html);

// 1. Ensure there is a strong H1 if not present or improve it
const h1Count = $('h1').length;
if (h1Count === 0) {
  // If no H1, let's prepend one to the body visually hidden for SEO
  $('body').prepend('<h1 style="position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;">SIM Energy | Ingeniería Eléctrica, Montajes y Mantenimiento en Venezuela</h1>');
} else {
  // Enhance existing H1
  $('h1').first().text('SIM Energy | Ingeniería Eléctrica y Servicios Integrales en Venezuela');
}

// 2. Enhance H2 tags
// Find headings that might be generic and enhance them
$('h2').each((i, el) => {
  const text = $(el).text().trim().toLowerCase();
  
  if (text.includes('proyectos')) {
    $(el).text('Nuestros Últimos Proyectos de Ingeniería Eléctrica');
  } else if (text.includes('servicios') || text === '') {
    $(el).text('Servicios Integrales: Mantenimiento, Obras Civiles y Calidad de Energía');
  }
});

// 3. Add an extra H2 before key sections if possible
// We know Divi sections often have et_pb_section classes. Let's find an empty one or inject.
// For now, let's just make sure the headings are descriptive.

// 4. Inject an H3 block into the footer area for SEO keyword coverage
const seoBlock = `
<div style="background-color: #224982; color: #fff; padding: 20px; text-align: center; font-size: 14px;">
  <div class="container">
    <h3 style="color: #fcc92f; font-size: 18px; margin-bottom: 10px;">Soluciones en Ingeniería Eléctrica para la Industria</h3>
    <p>Especialistas en <strong>montajes eléctricos</strong>, <strong>obras civiles industriales</strong>, <strong>sistemas fotovoltaicos</strong> y <strong>calidad de energía</strong>. Con un fuerte enfoque en confiabilidad y seguridad, SIM Energy expande sus operaciones brindando servicios de alta tecnología en Venezuela.</p>
  </div>
</div>
`;

// Insert the SEO block right before the main footer
$('#main-footer').before(seoBlock);

fs.writeFileSync(indexPath, $.html(), 'utf8');
console.log('SEO keywords (H1/H2/H3) enhanced in index.html');
