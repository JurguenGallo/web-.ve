const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SITE = path.join(__dirname, '..', 'frontend', 'public');

const seoData = {
  'index.html': {
    title: 'SIM Energy | Ingeniería Eléctrica y Paneles Solares en Venezuela',
    desc: 'SIM Energy Venezuela: proyectos de ingeniería eléctrica, paneles solares, montajes, calidad de energía, climatización y obras civiles en todo el país.',
    imgContext: 'Servicios de ingeniería y energía en Venezuela'
  },
  'quienes-somos/index.html': {
    title: 'Quiénes Somos | SIM Energy Venezuela',
    desc: 'Conoce SIM Energy Venezuela. Somos especialistas con más de 12 años de experiencia en ingeniería eléctrica, obras civiles y energías renovables.',
    imgContext: 'Equipo de SIM Energy'
  },
  'solucionesfotovoltaicas/index.html': {
    title: 'Paneles Solares y Soluciones Fotovoltaicas en Venezuela | SIM Energy',
    desc: 'Instalación de paneles solares y sistemas fotovoltaicos en Venezuela. Reduce tu dependencia de la red eléctrica con nuestras soluciones de energía solar.',
    imgContext: 'Instalación de paneles solares'
  },
  'alquilerequiposelectricos/index.html': {
    title: 'Alquiler de Equipos y Plantas Eléctricas en Venezuela | SIM Energy',
    desc: 'Alquiler de plantas eléctricas, transformadores y equipos eléctricos en Venezuela para respaldar tu operación y evitar paradas por cortes de energía.',
    imgContext: 'Alquiler de plantas eléctricas'
  },
  'galeria/index.html': {
    title: 'Galería de Proyectos | SIM Energy Venezuela',
    desc: 'Explora nuestra galería de proyectos: instalaciones eléctricas, sistemas de paneles solares y montajes realizados por SIM Energy en Venezuela.',
    imgContext: 'Proyecto de SIM Energy'
  },
  'contacto/index.html': {
    title: 'Contacto | SIM Energy Venezuela',
    desc: 'Contacta a SIM Energy Venezuela. Estamos listos para asesorarte en tus proyectos de ingeniería eléctrica, paneles solares y montajes.',
    imgContext: 'Soporte y contacto'
  },
  'trabaja-con-nosotros/index.html': {
    title: 'Trabaja con Nosotros | SIM Energy Venezuela',
    desc: 'Únete al equipo de SIM Energy Venezuela. Buscamos talento en ingeniería eléctrica, energía solar y áreas afines. Envía tu hoja de vida.',
    imgContext: 'Oportunidad laboral'
  },
  'energia-renovables/index.html': {
    title: 'Energías Renovables en Venezuela | SIM Energy',
    desc: 'Impulsamos las energías renovables en Venezuela. Conoce nuestros servicios en energía solar, diseño e implementación para un futuro sostenible.',
    imgContext: 'Proyecto de energía renovable'
  }
};

Object.keys(seoData).forEach(relPath => {
  const fullPath = path.join(SITE, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping: ${relPath} (Not found)`);
    return;
  }

  let html = fs.readFileSync(fullPath, 'utf8');
  const $ = cheerio.load(html);
  let changed = false;

  const data = seoData[relPath];

  // 1. Update Title
  const titleTag = $('title');
  if (titleTag.length) {
    if (titleTag.text() !== data.title) {
      titleTag.text(data.title);
      changed = true;
    }
  } else {
    $('head').append(`<title>${data.title}</title>`);
    changed = true;
  }

  // 2. Update Meta Description
  const descTag = $('meta[name="description"]');
  if (descTag.length) {
    if (descTag.attr('content') !== data.desc) {
      descTag.attr('content', data.desc);
      changed = true;
    }
  } else {
    $('head').append(`<meta name="description" content="${data.desc}">`);
    changed = true;
  }

  // Update OG:Title and OG:Description
  const ogTitle = $('meta[property="og:title"]');
  if (ogTitle.length) {
    ogTitle.attr('content', data.title);
    changed = true;
  }
  const ogDesc = $('meta[property="og:description"]');
  if (ogDesc.length) {
    ogDesc.attr('content', data.desc);
    changed = true;
  }

  // 3. Optimize Images (Alt tags and Lazy Loading)
  $('img').each((i, el) => {
    const img = $(el);
    let alt = img.attr('alt');
    
    // If no alt or empty alt, give it a descriptive one
    if (!alt || alt.trim() === '') {
      img.attr('alt', `${data.imgContext} - Imagen ${i + 1}`);
      changed = true;
    }

    // Add lazy loading if it's not a logo and doesn't have it
    // Skip if fetchpriority="high" or if it already has loading attr
    const src = img.attr('src') || '';
    const isLogo = src.toLowerCase().includes('logo');
    const hasHighPriority = img.attr('fetchpriority') === 'high';
    
    if (!isLogo && !hasHighPriority && !img.attr('loading')) {
      img.attr('loading', 'lazy');
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(fullPath, $.html(), 'utf8');
    console.log(`Updated SEO metadata and images for: ${relPath}`);
  } else {
    console.log(`No changes needed for: ${relPath}`);
  }
});

console.log('scale-seo.js completed.');
