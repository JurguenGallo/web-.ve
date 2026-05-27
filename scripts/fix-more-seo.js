const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const sharp = require('sharp');

const PUBLIC = path.join(__dirname, '..', 'frontend', 'public');

// ── 1. Fix title too long in alquiler ──
console.log('\n📌 Fixing titles...');
const alqPath = path.join(PUBLIC, 'alquilerequiposelectricos', 'index.html');
let html = fs.readFileSync(alqPath, 'utf-8');
let $ = cheerio.load(html, { decodeEntities: false });
$('title').text('Alquiler de Equipos Eléctricos en Venezuela | SIM Energy');
fs.writeFileSync(alqPath, $.html(), 'utf-8');
console.log('✅ alquiler: title fixed');

// ── 2. Add Twitter Cards to all pages ──
console.log('\n📌 Adding Twitter Cards...');
const pages = [
  'index.html', 'quienes-somos/index.html',
  'solucionesfotovoltaicas/index.html', 'alquilerequiposelectricos/index.html',
  'galeria/index.html', 'contacto/index.html',
  'energia-renovables/index.html', 'trabaja-con-nosotros/index.html',
];

const twitterConfig = {
  'index.html': {
    card: 'summary_large_image',
    title: 'SIM Energy | Ingenier\u00eda El\u00e9ctrica en Venezuela',
    desc: 'Empresa de ingenier\u00eda el\u00e9ctrica con expansi\u00f3n en Venezuela. Soluciones fotovoltaicas, alquiler de equipos, obras civiles y mantenimiento.',
  },
  'quienes-somos/index.html': {
    card: 'summary',
    title: '\u00bfQui\u00e9nes somos? | SIM Energy Venezuela',
    desc: 'Conoce nuestra historia, misi\u00f3n y equipo. Ingenier\u00eda el\u00e9ctrica con origen colombiano y expansi\u00f3n en Venezuela.',
  },
  'solucionesfotovoltaicas/index.html': {
    card: 'summary_large_image',
    title: 'Paneles Solares y Energ\u00eda Solar en Venezuela | SIM Energy',
    desc: 'Soluciones fotovoltaicas llave en mano. Venta de paneles, inversores, bater\u00edas. Dise\u00f1o e instalaci\u00f3n en Venezuela.',
  },
  'alquilerequiposelectricos/index.html': {
    card: 'summary_large_image',
    title: 'Alquiler de Equipos El\u00e9ctricos en Venezuela | SIM Energy',
    desc: 'Alquiler de plantas el\u00e9ctricas, transformadores y equipos de construcci\u00f3n para proyectos industriales en Venezuela.',
  },
  'galeria/index.html': {
    card: 'summary',
    title: 'Galer\u00eda de Proyectos | SIM Energy Venezuela',
    desc: 'Galer\u00eda de proyectos de ingenier\u00eda el\u00e9ctrica ejecutados por SIM Energy en Venezuela y Colombia.',
  },
  'contacto/index.html': {
    card: 'summary',
    title: 'Contacto | SIM Energy Venezuela',
    desc: 'Comun\u00edcate con SIM Energy en San Crist\u00f3bal, T\u00e1chira. Tel\u00e9fono, email y formulario de contacto.',
  },
  'energia-renovables/index.html': {
    card: 'summary_large_image',
    title: 'Energ\u00edas Renovables en Venezuela | SIM Energy',
    desc: 'Soluciones de energ\u00eda renovable, solar fotovoltaica y eficiencia energ\u00e9tica en Venezuela.',
  },
  'trabaja-con-nosotros/index.html': {
    card: 'summary',
    title: 'Trabaja con Nosotros | SIM Energy Venezuela',
    desc: '\u00danete al equipo de SIM Energy. Env\u00eda tu hoja de vida a gerencia@simenergy.com.',
  },
};

pages.forEach(p => {
  const fp = path.join(PUBLIC, p);
  let h = fs.readFileSync(fp, 'utf-8');
  $ = cheerio.load(h, { decodeEntities: false });
  const head = $('head');
  const cfg = twitterConfig[p];
  let changed = false;

  if (!$('meta[name="twitter:card"]').length) {
    head.append(`<meta name="twitter:card" content="${cfg.card}">`);
    changed = true;
  }
  if (!$('meta[name="twitter:title"]').length) {
    head.append(`<meta name="twitter:title" content="${cfg.title}">`);
    changed = true;
  }
  if (!$('meta[name="twitter:description"]').length) {
    head.append(`<meta name="twitter:description" content="${cfg.desc}">`);
    changed = true;
  }
  if (!$('meta[name="twitter:image"]').length) {
    head.append('<meta name="twitter:image" content="/wp-content/uploads/2025/02/logo-sim2025.png">');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, $.html(), 'utf-8');
    console.log(`  ✅ ${p}: Twitter Cards added`);
  }
});

// ── 3. Add og:image to alquiler (missing) ──
console.log('\n📌 Fixing OG tags...');
const alqPath2 = path.join(PUBLIC, 'alquilerequiposelectricos', 'index.html');
let h2 = fs.readFileSync(alqPath2, 'utf-8');
$ = cheerio.load(h2, { decodeEntities: false });
const head2 = $('head');
if (!$('meta[property="og:image"]').length) {
  head2.append('<meta property="og:image" content="/wp-content/uploads/2025/02/logo-sim2025.png">');
  fs.writeFileSync(alqPath2, $.html(), 'utf-8');
  console.log('  ✅ alquiler: og:image added');
}

// ── 4. Optimize images > 200KB ──
console.log('\n📸 Optimizing large images...');
const imgExts = ['.png', '.jpg', '.jpeg'];
const allImgs = fs.readdirSync(PUBLIC, { recursive: true })
  .filter(f => imgExts.some(e => f.toLowerCase().endsWith(e)))
  .filter(f => fs.statSync(path.join(PUBLIC, f)).size > 200 * 1024);

let optimized = 0;
let totalSaved = 0;

allImgs.forEach(f => {
  const fp = path.join(PUBLIC, f);
  const originalSize = fs.statSync(fp).size;
  const ext = path.extname(f).toLowerCase();

  try {
    let pipeline = sharp(fp);
    if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    } else {
      pipeline = pipeline.jpeg({ quality: 80 });
    }

    const tmp = fp + '.tmp';
    pipeline.toFileSync(tmp);
    const newSize = fs.statSync(tmp).size;
    if (newSize < originalSize) {
      fs.unlinkSync(fp);
      fs.renameSync(tmp, fp);
      const saved = ((originalSize - newSize) / 1024).toFixed(1);
      totalSaved += (originalSize - newSize);
      optimized++;
      console.log(`  ✓ ${f}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (-${saved}KB)`);
    } else {
      fs.unlinkSync(tmp);
    }
  } catch (e) {
    console.log(`  ✗ ${f}: ${e.message.substring(0, 60)}`);
  }
});

console.log(`\n📊 Images optimized: ${optimized}/${allImgs.length}`);
console.log(`💾 Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);

// ── 5. Re-minify all HTML (cheerio may have added formatting) ──
console.log('\n📦 Re-minifying HTML...');
const htmlFiles = fs.readdirSync(PUBLIC, { recursive: true }).filter(f => f.endsWith('.html'));
htmlFiles.forEach(f => {
  const fp = path.join(PUBLIC, f);
  let content = fs.readFileSync(fp, 'utf-8');
  const originalSize = Buffer.byteLength(content, 'utf-8');
  content = content.replace(/>\s+</g, '><');
  content = content.replace(/^\s+|\s+$/gm, '');
  content = content.replace(/  +/g, ' ');
  content = content.replace(/<!--.*?-->/gs, '');
  content = content.replace(/\n\s*\n/g, '\n');
  const newSize = Buffer.byteLength(content, 'utf-8');
  fs.writeFileSync(fp, content, 'utf-8');
  const saved = originalSize - newSize;
  if (saved > 0) console.log(`  ✓ ${f}: -${(saved/1024).toFixed(1)}KB`);
});

console.log('\n✅ All fixes complete!\n');
