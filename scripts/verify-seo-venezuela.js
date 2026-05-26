const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SITE_DIR = path.join(__dirname, '..', 'frontend', 'public');

const getHtmlFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
};

const htmlFiles = getHtmlFiles(SITE_DIR);
let errorsCount = 0;

console.log('=== VERIFICANDO ARCHIVOS HTML PARA VENEZUELA ===\n');

htmlFiles.forEach(file => {
  const relPath = path.relative(SITE_DIR, file);
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  const fileErrors = [];

  // 1. Verificar canónica absoluta
  const canonical = $('link[rel="canonical"]');
  if (canonical.length) {
    const href = canonical.attr('href') || '';
    if (!href.startsWith('https://www.simenergy.com.ve')) {
      fileErrors.push(`Canonical no absoluta o incorrecta: "${href}"`);
    }
  } else {
    fileErrors.push('Falta etiqueta canonical');
  }

  // 2. Verificar og:url absoluta
  const ogUrl = $('meta[property="og:url"]');
  if (ogUrl.length) {
    const content = ogUrl.attr('content') || '';
    if (!content.startsWith('https://www.simenergy.com.ve')) {
      fileErrors.push(`og:url no absoluta o incorrecta: "${content}"`);
    }
  } else {
    fileErrors.push('Falta etiqueta og:url');
  }

  // 3. Verificar etiquetas hreflang (debe tener es-CO, es-VE, x-default)
  const hreflangs = $('link[hreflang]');
  const expectedHreflangs = ['es-co', 'es-ve', 'x-default'];
  const presentHreflangs = [];
  
  hreflangs.each((_, elem) => {
    presentHreflangs.push($(elem).attr('hreflang').toLowerCase());
  });

  expectedHreflangs.forEach(lang => {
    if (!presentHreflangs.includes(lang)) {
      fileErrors.push(`Falta etiqueta hreflang para: "${lang}"`);
    }
  });

  // 4. Verificar números colombianos (+57, wa.me/57, etc.)
  if (html.includes('wa.me/57') || html.includes('wa.me/http') || /wa\.me\/57\d+/.test(html)) {
    fileErrors.push('Enlace WhatsApp colombiano detectado');
  }
  if (html.includes('573224283762') || html.includes('573123455998')) {
    fileErrors.push('Número celular colombiano crudo detectado');
  }
  if (/\(607\)\s*576\s*30\s*15/.test(html) || html.includes('576 30 15')) {
    fileErrors.push('Número fijo de Cúcuta detectado');
  }
  if (html.includes('323 227 2966') || /323\s*227\s*2966/.test(html)) {
    fileErrors.push('Número celular colombiano (323 227 2966) detectado');
  }

  // 5. Verificar dominios colombianos en slider client links
  if (html.includes('aerocivil.gov.co') || html.includes('termotasajero.com.co') || html.includes('esehjcs.gov.co') || html.includes('siemens.com/co')) {
    fileErrors.push('Dominio de portal colombiano no neutralizado detectado (Aerocivil, Termotasajero, ESE Hospital o Siemens CO)');
  }

  if (fileErrors.length > 0) {
    console.log(`❌ ${relPath}:`);
    fileErrors.forEach(err => console.log(`   - ${err}`));
    errorsCount += fileErrors.length;
  } else {
    console.log(`✅ ${relPath}: OK`);
  }
});

console.log(`\n=== VERIFICACIÓN COMPLETADA ===`);
if (errorsCount > 0) {
  console.log(`❌ Se encontraron ${errorsCount} errores en total.`);
  process.exit(1);
} else {
  console.log('🎉 ¡Todos los archivos pasaron la verificación SEO para Venezuela!');
  process.exit(0);
}
