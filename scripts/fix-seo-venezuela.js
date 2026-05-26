const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

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

htmlFiles.forEach(relPath => {
  const fullPath = path.join(SITE, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping: ${relPath} (Not found)`);
    return;
  }

  let html = fs.readFileSync(fullPath, 'utf8');
  const $ = cheerio.load(html);
  let changed = false;

  // Normalize path format for absolute URLs (using forward slashes)
  const normRelPath = relPath.replace(/\\/g, '/');

  // 1. Fix canonical tag to use absolute URL
  const canonical = $('link[rel="canonical"]');
  if (canonical.length) {
    let href = canonical.attr('href') || '';
    if (href.startsWith('/')) {
      canonical.attr('href', 'https://www.simenergy.com.ve' + href);
      changed = true;
    } else if (href.includes('simenergy.com.co')) {
      canonical.attr('href', href.replace(/simenergy\.com\.co/g, 'simenergy.com.ve'));
      changed = true;
    }
  }

  // 2. Fix og:url to use absolute URL
  const ogUrl = $('meta[property="og:url"]');
  if (ogUrl.length) {
    let content = ogUrl.attr('content') || '';
    if (content.startsWith('/')) {
      ogUrl.attr('content', 'https://www.simenergy.com.ve' + content);
      changed = true;
    } else if (content.includes('simenergy.com.co')) {
      ogUrl.attr('content', content.replace(/simenergy\.com\.co/g, 'simenergy.com.ve'));
      changed = true;
    }
  }

  // 3. Inject Hreflang annotations
  let subpath = normRelPath === 'index.html' ? '/' : `/${normRelPath.replace('index.html', '')}`;
  
  // Remove existing hreflang tags to prevent duplication
  $('link[hreflang]').remove();
  
  // Append hreflang tags to the head
  $('head').append(`\n  <link rel="alternate" hreflang="es-CO" href="https://www.simenergy.com.co${subpath}" />`);
  $('head').append(`\n  <link rel="alternate" hreflang="es-VE" href="https://www.simenergy.com.ve${subpath}" />`);
  $('head').append(`\n  <link rel="alternate" hreflang="x-default" href="https://www.simenergy.com.co${subpath}" />`);
  changed = true;

  // 4. Clean JSON-LD graphs (updating relative URLs and domains)
  const schemaScripts = $('script[type="application/ld+json"]');
  schemaScripts.each((_, script) => {
    try {
      const text = $(script).html();
      if (!text) return;
      const data = JSON.parse(text);

      const processJsonLd = (obj) => {
        if (typeof obj === 'string') {
          if (obj === '/' || obj.startsWith('/')) {
            return 'https://www.simenergy.com.ve' + obj;
          }
          if (obj.includes('simenergy.com.co')) {
            return obj.replace(/simenergy\.com\.co/g, 'simenergy.com.ve');
          }
          return obj;
        } else if (Array.isArray(obj)) {
          return obj.map(processJsonLd);
        } else if (obj && typeof obj === 'object') {
          for (const key in obj) {
            obj[key] = processJsonLd(obj[key]);
          }
        }
        return obj;
      };

      const updatedData = processJsonLd(data);
      $(script).html(JSON.stringify(updatedData));
      changed = true;
    } catch (e) {
      // Ignore schema parse issues (like empty or malformed strings)
    }
  });

  // Render HTML to apply Cheerio modifications
  let outputHtml = $.html();

  // 5. Localize contacts & phone numbers
  // Replace WhatsApp numbers
  if (outputHtml.includes('wa.me/')) {
    outputHtml = outputHtml.replace(/wa\.me\/57\d+/gi, 'wa.me/584120000000');
    outputHtml = outputHtml.replace(/wa\.me\/http/gi, 'wa.me/584120000000');
    changed = true;
  }
  // Standardize protocol on WhatsApp links
  if (outputHtml.includes('http://wa.me/')) {
    outputHtml = outputHtml.replace(/http:\/\/wa\.me\//gi, 'https://wa.me/');
    changed = true;
  }
  if (outputHtml.includes('573224283762')) {
    outputHtml = outputHtml.replace(/573224283762/g, '584120000000');
    changed = true;
  }
  if (outputHtml.includes('573123455998')) {
    outputHtml = outputHtml.replace(/573123455998/g, '584120000000');
    changed = true;
  }

  // Replace fixed line Cúcuta (607) 576 30 15
  const phoneRegex = /\(607\)\s*576\s*30\s*15/gi;
  if (phoneRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(phoneRegex, '+58 (212) 000-0000');
    changed = true;
  }
  if (outputHtml.includes('576 30 15')) {
    outputHtml = outputHtml.replace(/576\s*30\s*15/g, '(212) 000-0000');
    changed = true;
  }

  // Replace +57 323 227 2966
  const mobRegex = /\+57\s*(?:&nbsp;\s*)?323\s*227\s*2966/gi;
  if (mobRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(mobRegex, '+58&nbsp;412 000 0000');
    changed = true;
  }
  if (outputHtml.includes('323 227 2966')) {
    outputHtml = outputHtml.replace(/323\s*227\s*2966/g, '412 000 0000');
    changed = true;
  }

  // 6. Clean up slider client links pointing to Colombian portals (supporting both href and data-href)
  if (outputHtml.includes('aerocivil.gov.co') || outputHtml.includes('termotasajero.com.co') || outputHtml.includes('esehjcs.gov.co') || outputHtml.includes('siemens.com/co')) {
    outputHtml = outputHtml.replace(/(href|data-href)="https:\/\/www\.aerocivil\.gov\.co\/?"/gi, '$1="#"');
    outputHtml = outputHtml.replace(/(href|data-href)="https:\/\/termotasajero\.com\.co\/?"/gi, '$1="#"');
    outputHtml = outputHtml.replace(/(href|data-href)="https:\/\/esehjcs\.gov\.co\/web\/?"/gi, '$1="#"');
    outputHtml = outputHtml.replace(/(href|data-href)="https:\/\/www\.siemens\.com\/co\/es\/compania\/acerca-de-nosotros\.html"/gi, '$1="https://www.siemens.com/"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, outputHtml, 'utf8');
    console.log(`Successfully fixed SEO and contact details in: ${relPath}`);
  }
});

console.log('fix-seo-venezuela.js completed.');
