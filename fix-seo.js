const fs = require('fs');
const path = require('path');

const SITE = path.join(__dirname, 'sitio-estatico', 'www.simenergy.com.co');

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

// Alt text map for known images
const altMap = {
  'Presentes5.png': 'Equipo SIM Energy en proyecto de ingeniería eléctrica',
  'Presentes768.png': 'Personal técnico SIM Energy en instalación eléctrica industrial',
  'ICONTEC.png': 'Certificación ICONTEC de calidad SIM Energy',
  'fotos.png': 'Proyectos eléctricos ejecutados por SIM Energy en Colombia',
  'generador-electrico.png': 'Servicio de instalación de generadores eléctricos industriales',
  'cable.png': 'Montaje de cableado eléctrico de alta tensión',
  'torre-electrica-1.png': 'Montaje de torres eléctricas y líneas de transmisión',
  'electricidad2.png': 'Ingeniería eléctrica industrial y sistemas de potencia',
  'red.png': 'Redes eléctricas y distribución de energía',
  'electricidad-1.png': 'Sistemas de distribución eléctrica industrial',
  'viento.png': 'Energía renovable y proyectos eólicos SIM Energy',
  'background2.png': 'Fondo corporativo SIM Energy servicios de ingeniería',
  'proyecto.png': 'Proyecto de ingeniería ejecutado por SIM Energy',
  'logo-sim2025.png': 'Logo SIM Energy - Ingeniería Eléctrica y Servicios Integrales',
  'cropped-favicon-1-32x32.png': 'Favicon SIM Energy',
  'cropped-favicon-1-192x192.png': 'Icono SIM Energy',
  'cropped-favicon-1-180x180.png': 'Icono SIM Energy para Apple',
  'cropped-favicon-1-270x270.png': 'Icono SIM Energy para Microsoft',
  'colombia-sim.png': 'Mapa de Colombia con presencia SIM Energy',
};

htmlFiles.forEach(relPath => {
  const fullPath = path.join(SITE, relPath);
  if (!fs.existsSync(fullPath)) return;

  let html = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // 1. Fix viewport: clean up commas
  const viewportRegex = /<meta name="viewport" content="([^"]*)">/g;
  html = html.replace(viewportRegex, (match, content) => {
    const cleaned = content
      .replace(/,\s*,+/g, ',')
      .replace(/,\s*$/, '')
      .replace(/^\s*,/, '')
      .trim();
    if (cleaned !== content) { changed = true; }
    return `<meta name="viewport" content="${cleaned}">`;
  });

  // 1b. Update title for .ve
  if (relPath === 'index.html') {
    html = html.replace(
      /<title>SIM Energy - Ingeniería y Servicios Integrales<\/title>/,
      '<title>SIM Energy | Ingeniería Eléctrica en Venezuela</title>'
    );
    html = html.replace(
      /<meta name="description" content="([^"]*)"/,
      '<meta name="description" content="SIM Energy Venezuela: ingeniería eléctrica, montajes, calidad de energía, climatización y obras civiles en todo el país."'
    );
    changed = true;
  }

  // 2. Fix H1 duplicates on homepage
  if (relPath === 'index.html') {
    const h1Count = (html.match(/<h1[^>]*>/g) || []).length;
    if (h1Count > 1) {
      let first = true;
      html = html.replace(/<h1[^>]*>Últimos proyectos<\/h1>/g, () => {
        if (first) { first = false; return '<h1>Ingeniería Eléctrica y Servicios Integrales en Venezuela | SIM Energy</h1>'; }
        return '<h2>Últimos proyectos</h2>';
      });
      changed = true;
    }
  }

  // 3. Add alt text to images missing it
  const imgRegex = /<img[^>]*src="([^"]*)"([^>]*)>/g;
  html = html.replace(imgRegex, (match, src, rest) => {
    if (/alt\s*=\s*["']/.test(rest)) return match; // already has alt

    // Find filename in src
    const filename = src.split('/').pop().split('?')[0];
    const alt = altMap[filename];

    if (alt) {
      changed = true;
      return `<img src="${src}" alt="${alt}"${rest}>`;
    }
    // Generic alt based on filename
    if (filename.match(/\.(png|jpg|jpeg|webp|gif)$/i) && !filename.includes('favicon')) {
      changed = true;
      const name = path.basename(filename, path.extname(filename))
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return `<img src="${src}" alt="${name}"${rest}>`;
    }
    return match;
  });

  // 4. Add ProfessionalService schema after Yoast schema (homepage only)
  if (relPath === 'index.html') {
    const schema = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "name": "SIM Energy",
  "legalName": "SIM Energy S.A.S.",
  "url": "https://www.simenergy.com.ve",
  "logo": "https://www.simenergy.com.ve/wp-content/uploads/2025/02/logo-sim2025.png",
  "description": "Empresa de ingeniería eléctrica, montajes eléctricos, calidad de energía, climatización y obras civiles en Venezuela.",
  "email": "info@simenergy.com.ve",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "VE"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Venezuela"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de Ingeniería",
    "itemListElement": [
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Montajes Eléctricos"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Calidad de Energía"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Climatización Industrial"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Obras Civiles Industriales"}}
    ]
  },
  "sameAs": [
    "https://www.facebook.com/simenergysas",
    "https://instagram.com/simenergysas/",
    "https://www.linkedin.com/in/sim-energy-40352720a/"
  ]
}
</script>`;
    if (!html.includes('ProfessionalService')) {
      html = html.replace(
        /<!-- \/ Yoast SEO Premium plugin\. -->/,
        `<!-- / Yoast SEO Premium plugin. -->${schema}`
      );
      changed = true;
    }
  }

  // 5. Fix og:image to use existing logo
  if (relPath === 'index.html') {
    html = html.replace(
      /<meta property="og:image" content="[^"]*">/,
      '<meta property="og:image" content="/wp-content/uploads/2025/02/logo-sim2025.png">'
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*">/,
      '<meta name="twitter:image" content="/wp-content/uploads/2025/02/logo-sim2025.png">'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, html);
    console.log(`  Fixed: ${relPath}`);
  }
});

console.log('\nDone! Fixes applied where needed.');
