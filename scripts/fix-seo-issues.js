const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PUBLIC = path.join(__dirname, '..', 'frontend', 'public');

const FIXES = {
  // ── GALERIA ──
  'galeria/index.html': {
    title: null, // keep existing
    h1: 'Galería de Proyectos',
    og: {
      description: 'Conoce nuestros proyectos de ingeniería eléctrica, instalaciones solares y obras civiles ejecutados por SIM Energy en Venezuela y Colombia.',
      image: '/wp-content/uploads/2025/02/logo-sim2025.png',
    },
  },
  // ── CONTACTO ──
  'contacto/index.html': {
    title: null,
    // Fix multiple H1s: downgrade extra H1s to H2
    h1: null, // will keep "Contacto" and downgrade the others
    og: {
      description: 'Comunícate con SIM Energy. Oficina en San Cristóbal, Táchira, Venezuela. Teléfono, email y formulario de contacto.',
      image: '/wp-content/uploads/2025/02/logo-sim2025.png',
    },
  },
  // ── TRABAJA CON NOSOTROS ──
  'trabaja-con-nosotros/index.html': {
    title: null,
    h1: null,
    og: {
      description: 'Únete al equipo de SIM Energy. Envía tu hoja de vida y forma parte de una empresa líder en ingeniería eléctrica en Venezuela.',
      image: '/wp-content/uploads/2025/02/logo-sim2025.png',
    },
  },
  // ── ENERGIA RENOVABLES ──
  'energia-renovables/index.html': {
    title: null,
    // 3 H1s: "Calculadora fotovoltaica", "Soluciones fotovoltaicas", "¿Qué nos hace únicos?"
    // Keep only "Calculadora fotovoltaica" as H1, downgrade others to H2
    og: null,
  },
  // ── SOLUCIONES FOTOVOLTAICAS ──
  'solucionesfotovoltaicas/index.html': {
    title: 'Paneles Solares y Energía Solar en Venezuela | SIM Energy',
    // 3 H1s: same pattern
    og: null,
  },
};

function fixPage(filePath, fixes) {
  const fullPath = path.join(PUBLIC, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ❌ File not found: ${filePath}`);
    return;
  }

  let html = fs.readFileSync(fullPath, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false, xmlMode: false });

  let changes = 0;

  // ── Fix Title ──
  if (fixes.title) {
    const oldTitle = $('title').text();
    $('title').text(fixes.title);
    console.log(`  ✅ Title: "${oldTitle}" → "${fixes.title}"`);
    changes++;
  }

  // ── Fix H1 ──
  if (fixes.h1) {
    // If there are no H1s, add one before the first H2
    const h1s = $('h1');
    if (h1s.length === 0) {
      const firstH2 = $('h2').first();
      if (firstH2.length) {
        firstH2.before(`<h1>${fixes.h1}</h1>`);
        console.log(`  ✅ Added H1: "${fixes.h1}"`);
        changes++;
      }
    }
  }

  // ── Fix Multiple H1s (keep first, downgrade rest to H2) ──
  const h1Count = $('h1').length;
  if (h1Count > 1) {
    $('h1').each((i, el) => {
      if (i > 0) {
        const content = $(el).html();
        const newH2 = $(`<h2>${content}</h2>`);
        $(el).replaceWith(newH2);
        changes++;
      }
    });
    console.log(`  ✅ Reduced H1s: ${h1Count} → 1`);
  }

  // ── Fix Heading Hierarchy: H2→H4 jumps (add H3 wrappers around H4 items that follow H2 directly) ──
  // Look for H2 followed immediately by H4 in the same parent - wrap the H4s in H3
  // Actually, this is tricky in minified Divi markup. Let me handle the known cases.

  // ── Add OG Meta ──
  if (fixes.og) {
    const head = $('head');

    if (fixes.og.description) {
      if (!$('meta[property="og:description"]').length) {
        head.append(`<meta property="og:description" content="${fixes.og.description}">`);
        console.log(`  ✅ Added og:description`);
        changes++;
      }
    }

    if (fixes.og.image) {
      if (!$('meta[property="og:image"]').length) {
        head.append(`<meta property="og:image" content="${fixes.og.image}">`);
        console.log(`  ✅ Added og:image`);
        changes++;
      }
    }
  }

  if (changes === 0) {
    console.log(`  ℹ️ No changes needed for ${filePath}`);
    return;
  }

  // Save
  const output = $.html();
  fs.writeFileSync(fullPath, output, 'utf-8');
  console.log(`  💾 Saved: ${filePath} (${changes} changes)`);
}

// ── H1→H2 downgrade for energia-renovables and solucionesfotovoltaicas ──
function fixMultipleH1s(filePath) {
  const fullPath = path.join(PUBLIC, filePath);
  const html = fs.readFileSync(fullPath, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const h1s = $('h1');
  if (h1s.length <= 1) return false;

  let changed = false;
  $('h1').each((i, el) => {
    if (i > 0) {
      const content = $(el).html();
      const newTag = $(`<h2>${content}</h2>`);
      $(el).replaceWith(newTag);
      changed = true;
    }
  });

  if (changed) {
    const output = $.html();
    fs.writeFileSync(fullPath, output, 'utf-8');
    console.log(`  ✅ ${filePath}: Reduced H1s from ${h1s.length} → 1`);
  }
  return changed;
}

// ── Add OG tags ──
function addOGTags(filePath, og) {
  const fullPath = path.join(PUBLIC, filePath);
  const html = fs.readFileSync(fullPath, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const head = $('head');
  let changed = false;

  if (og.description && !$('meta[property="og:description"]').length) {
    head.append(`<meta property="og:description" content="${og.description}">`);
    changed = true;
  }
  if (og.image && !$('meta[property="og:image"]').length) {
    head.append(`<meta property="og:image" content="${og.image}">`);
    changed = true;
  }

  if (changed) {
    const output = $.html();
    fs.writeFileSync(fullPath, output, 'utf-8');
    console.log(`  ✅ ${filePath}: OG tags added`);
  }
  return changed;
}

// ── Add H1 if missing ──
function addH1(filePath, text) {
  const fullPath = path.join(PUBLIC, filePath);
  const html = fs.readFileSync(fullPath, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });

  if ($('h1').length > 0) return false;

  const firstH2 = $('h2').first();
  if (firstH2.length) {
    firstH2.before(`<h1>${text}</h1>`);
    const output = $.html();
    fs.writeFileSync(fullPath, output, 'utf-8');
    console.log(`  ✅ ${filePath}: Added H1 "${text}"`);
    return true;
  }
  return false;
}

// ── Fix title ──
function fixTitle(filePath, newTitle) {
  const fullPath = path.join(PUBLIC, filePath);
  const html = fs.readFileSync(fullPath, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });

  const oldTitle = $('title').text();
  if (oldTitle === newTitle) return false;

  $('title').text(newTitle);
  const output = $.html();
  fs.writeFileSync(fullPath, output, 'utf-8');
  console.log(`  ✅ ${filePath}: Title "${oldTitle}" → "${newTitle}"`);
  return true;
}

// ── MAIN ──
console.log('\n🔧 Starting SEO fixes...\n');

// 1. Fix multiple H1s
console.log('\n📌 Fixing multiple H1s...');
fixMultipleH1s('contacto/index.html');      // 2→1 H1
fixMultipleH1s('energia-renovables/index.html'); // 3→1 H1
fixMultipleH1s('solucionesfotovoltaicas/index.html'); // 3→1 H1

// 2. Add H1 to Galería
console.log('\n📌 Adding missing H1...');
addH1('galeria/index.html', 'Galería de Proyectos');

// 3. Fix title
console.log('\n📌 Fixing titles...');
fixTitle('solucionesfotovoltaicas/index.html', 'Paneles Solares y Energía Solar en Venezuela | SIM Energy');

// 4. Add OG tags
console.log('\n📌 Adding OG meta tags...');
addOGTags('galeria/index.html', {
  description: 'Conoce nuestros proyectos de ingeniería eléctrica, instalaciones solares y obras civiles ejecutados por SIM Energy en Venezuela y Colombia.',
  image: '/wp-content/uploads/2025/02/logo-sim2025.png',
});
addOGTags('contacto/index.html', {
  description: 'Comunícate con SIM Energy. Oficina en San Cristóbal, Táchira, Venezuela. Teléfono, email y formulario de contacto.',
  image: '/wp-content/uploads/2025/02/logo-sim2025.png',
});
addOGTags('trabaja-con-nosotros/index.html', {
  description: 'Únete al equipo de SIM Energy. Envía tu hoja de vida y forma parte de una empresa líder en ingeniería eléctrica en Venezuela.',
  image: '/wp-content/uploads/2025/02/logo-sim2025.png',
});

console.log('\n✅ SEO fixes complete!\n');
