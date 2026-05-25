const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlFile = path.join(__dirname, 'sitio-estatico', 'www.simenergy.com.co', 'index.html');
const html = fs.readFileSync(htmlFile, 'utf8');

const $ = cheerio.load(html);

// 1. Corrección de Imágenes (Alt text)
const altMap = {
  'Presentes5.png': 'Equipo SIM Energy en proyecto de ingeniería eléctrica',
  'Presentes768.png': 'Personal técnico SIM Energy en instalación eléctrica industrial',
  'ICONTEC.png': 'Certificación ICONTEC de calidad SIM Energy',
  'fotos.png': 'Proyectos eléctricos ejecutados por SIM Energy en Venezuela',
  'generador-electrico.png': 'Servicio de instalación de generadores eléctricos industriales',
  'cable.png': 'Montaje de cableado eléctrico de alta tensión',
  'torre-electrica-1.png': 'Montaje de torres eléctricas y líneas de transmisión',
  'electricidad2.png': 'Ingeniería eléctrica industrial y sistemas de potencia',
  'red.png': 'Redes eléctricas y distribución de energía'
};

$('img').each((i, el) => {
  const src = $(el).attr('src') || $(el).attr('data-src') || '';
  const filename = src.split('/').pop();
  if (altMap[filename]) {
    $(el).attr('alt', altMap[filename]);
  } else if (!$(el).attr('alt')) {
    // Para las "18 imágenes más de proyectos"
    $(el).attr('alt', 'Proyecto de ingeniería eléctrica SIM Energy');
  }
});

// 2. Corrección de Viewport (Accesibilidad)
const viewportMeta = $('meta[name="viewport"]');
if (viewportMeta.length) {
  let content = viewportMeta.attr('content');
  content = content.replace(/user-scalable=0/g, 'user-scalable=1')
                   .replace(/maximum-scale=1\.0/g, ''); // Permite zoom natural
  viewportMeta.attr('content', content);
} else {
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
}

// 3. Corrección de og:title y twitter:title
$('meta[property="og:title"]').attr('content', 'SIM Energy - Ingeniería Eléctrica y Servicios Integrales');
if (!$('meta[name="twitter:title"]').length) {
    $('head').append('<meta name="twitter:title" content="SIM Energy - Ingeniería Eléctrica y Servicios Integrales">');
}

// 4. Agregar og:image y twitter:image
if (!$('meta[property="og:image"]').length) {
    $('head').append('<meta property="og:image" content="https://www.simenergy.com.ve/wp-content/uploads/og-image.jpg">');
}
if (!$('meta[name="twitter:image"]').length) {
    $('head').append('<meta name="twitter:image" content="https://www.simenergy.com.ve/wp-content/uploads/og-image.jpg">');
}

// 5. Schema JSON-LD
const schema = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "name": "SIM Energy",
  "legalName": "SIM Energy",
  "url": "https://www.simenergy.com.ve",
  "logo": "https://www.simenergy.com.ve/wp-content/uploads/2025/03/logo-sim2025.png",
  "description": "Empresa de ingeniería eléctrica, montajes eléctricos, calidad de energía, climatización y obras civiles industriales en Venezuela.",
  "email": "contacto@simenergy.com.ve",
  "telephone": "+58-COMPLETAR",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "COMPLETAR",
    "addressLocality": "COMPLETAR",
    "addressRegion": "COMPLETAR",
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
  }
}
</script>
`;
if (!html.includes('"ProfessionalService"')) {
    $('head').append(schema);
}

// 6. Corrección de H1
// Cambiamos todos los h1 que dicen "Últimos proyectos" a h2
$('h1').each((i, el) => {
  const text = $(el).text().trim().toLowerCase();
  if (text.includes('últimos proyectos') || text.includes('ultimos proyectos')) {
    $(el).replaceWith($('<h2>').append($(el).contents()).addClass($(el).attr('class') || ''));
  }
});
// Y aseguramos que haya un H1 principal al inicio
const existingH1 = $('h1');
if (existingH1.length === 0) {
  $('body').prepend('<h1 style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;">SIM Energy - Ingeniería Eléctrica y Servicios Integrales en Venezuela</h1>');
}

// 7. Tropicalización Básica (Colombia -> Venezuela)
let outputHtml = $.html();
// Reemplazos de texto bruto que puedan faltar (cuidado con no dañar tags, pero cheerio html output is string)
outputHtml = outputHtml.replace(/simenergy\.com\.co/g, 'simenergy.com.ve');
// Reemplazo básico de Colombia a Venezuela en el texto visible
// Es más seguro hacer esto con cheerio para solo tocar text nodes, pero por velocidad en este script podemos iterar text nodes.
// Mejor hacerlo con cheerio iterando:

const $out = cheerio.load(outputHtml);
$out('*').contents().each(function() {
    if (this.nodeType === 3) { // Text node
        let text = $(this).text();
        if (text.includes('Colombia')) {
            $(this).replaceWith(text.replace(/Colombia/g, 'Venezuela'));
        }
    }
});

fs.writeFileSync(htmlFile, $out.html(), 'utf8');
console.log('SEO and localization fixes applied to index.html successfully!');
