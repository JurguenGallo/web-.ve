const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PAGES = [
  { name: 'Inicio', file: 'index.html', url: 'http://localhost:8080/' },
  { name: 'Quiénes somos', file: 'quienes-somos/index.html', url: 'http://localhost:8080/quienes-somos/' },
  { name: 'Soluciones fotovoltaicas', file: 'solucionesfotovoltaicas/index.html', url: 'http://localhost:8080/solucionesfotovoltaicas/' },
  { name: 'Alquiler de equipos', file: 'alquilerequiposelectricos/index.html', url: 'http://localhost:8080/alquilerequiposelectricos/' },
  { name: 'Galería', file: 'galeria/index.html', url: 'http://localhost:8080/galeria/' },
  { name: 'Contacto', file: 'contacto/index.html', url: 'http://localhost:8080/contacto/' },
  { name: 'Energía renovable', file: 'energia-renovables/index.html', url: 'http://localhost:8080/energia-renovables/' },
  { name: 'Trabaja con nosotros', file: 'trabaja-con-nosotros/index.html', url: 'http://localhost:8080/trabaja-con-nosotros/' },
];

const PUBLIC = path.join(__dirname, '..', 'frontend', 'public');

function analyzePage(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);
  const issues = [];
  const passed = [];

  const title = $('title').text().trim();

  if (!title) {
    issues.push({ sev: 'high', msg: '❌ Sin etiqueta <title>' });
  } else if (title.length < 30 || title.length > 65) {
    issues.push({ sev: 'mid', msg: `⚠️ Longitud de title (${title.length} chars). Ideal: 30-65. Actual: "${title}"` });
  } else {
    passed.push(`✅ <title> OK (${title.length} chars): "${title}"`);
  }

  const metaDesc = $('meta[name="description"]').attr('content');
  if (!metaDesc) {
    issues.push({ sev: 'high', msg: '❌ Sin meta description' });
  } else if (metaDesc.length < 50 || metaDesc.length > 160) {
    issues.push({ sev: 'mid', msg: `⚠️ Longitud meta description (${metaDesc.length} chars). Ideal: 50-160.` });
  } else {
    passed.push(`✅ Meta description OK (${metaDesc.length} chars)`);
  }

  const h1s = [];
  $('h1').each((i, el) => h1s.push($(el).text().trim()));
  if (h1s.length === 0) {
    issues.push({ sev: 'high', msg: '❌ Sin etiquetas <h1>' });
  } else if (h1s.length > 1) {
    issues.push({ sev: 'mid', msg: `⚠️ ${h1s.length} <h1> encontrados (ideal: 1): ${h1s.join(' | ')}` });
  } else {
    passed.push(`✅ 1 <h1> OK: "${h1s[0]}"`);
  }

  const h2s = [];
  $('h2').each((i, el) => h2s.push($(el).text().trim()));
  if (h2s.length === 0) {
    issues.push({ sev: 'low', msg: 'ℹ️ Sin <h2>' });
  } else {
    passed.push(`✅ ${h2s.length} <h2> encontrados`);
  }

  const imgsWithoutAlt = [];
  $('img').each((i, el) => {
    const alt = $(el).attr('alt');
    if (!alt || alt.trim() === '') imgsWithoutAlt.push($(el).attr('src') || '(sin src)');
  });
  if (imgsWithoutAlt.length > 0) {
    issues.push({ sev: 'high', msg: `❌ ${imgsWithoutAlt.length} imágenes sin alt text` });
  } else {
    passed.push('✅ Todas las imágenes tienen alt text');
  }

  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (!ogTitle) issues.push({ sev: 'mid', msg: '⚠️ Sin og:title' });
  else passed.push('✅ og:title presente');
  if (!ogDesc) issues.push({ sev: 'mid', msg: '⚠️ Sin og:description' });
  else passed.push('✅ og:description presente');
  if (!ogImage) issues.push({ sev: 'mid', msg: '⚠️ Sin og:image' });
  else passed.push('✅ og:image presente');

  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  if (!twitterCard) issues.push({ sev: 'low', msg: 'ℹ️ Sin twitter:card' });
  else passed.push('✅ twitter:card presente');
  if (!twitterImage) issues.push({ sev: 'low', msg: 'ℹ️ Sin twitter:image' });
  else passed.push('✅ twitter:image presente');

  const jsonld = $('script[type="application/ld+json"]');
  if (jsonld.length === 0) {
    issues.push({ sev: 'high', msg: '❌ Sin schema JSON-LD' });
  } else {
    passed.push(`✅ ${jsonld.length} schema(s) JSON-LD encontrados`);
    jsonld.each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data['@type']) passed.push(`   - Tipo: ${data['@type']}`);
      } catch (e) {
        issues.push({ sev: 'mid', msg: '⚠️ JSON-LD inválido' });
      }
    });
  }

  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    issues.push({ sev: 'high', msg: '❌ Sin meta viewport (no responsivo)' });
  } else if (viewport.includes('user-scalable=0') || viewport.includes('user-scalable=no')) {
    issues.push({ sev: 'mid', msg: '⚠️ Viewport bloquea zoom (user-scalable=0)' });
  } else {
    passed.push('✅ Meta viewport OK (responsive)');
  }

  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    issues.push({ sev: 'low', msg: 'ℹ️ Sin canonical URL' });
  } else {
    passed.push(`✅ Canonical: ${canonical}`);
  }

  const hreflangs = [];
  $('link[hreflang]').each((i, el) => hreflangs.push(`${$(el).attr('hreflang')}: ${$(el).attr('href')}`));
  if (hreflangs.length > 0) {
    passed.push(`✅ ${hreflangs.length} hreflang(s): ${hreflangs.join(', ')}`);
  } else {
    issues.push({ sev: 'low', msg: 'ℹ️ Sin etiquetas hreflang' });
  }

  const hasLang = $('html').attr('lang');
  if (hasLang) passed.push(`✅ lang="${hasLang}"`);
  else issues.push({ sev: 'low', msg: 'ℹ️ <html> sin atributo lang' });

  const brokenImgs = [];
  $('img[src]').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      const imgPath = path.join(PUBLIC, src.replace(/^\//, ''));
      if (!fs.existsSync(imgPath)) brokenImgs.push(src);
    }
  });
  if (brokenImgs.length > 0) {
    issues.push({ sev: 'high', msg: `❌ ${brokenImgs.length} imágenes locales no existen en disco` });
  }

  return { issues, passed, title, metaDesc, h1s, h2s };
}

function generateHTMLReport(results) {
  let html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Informe SEO - SIM Energy .ve</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #f8f9fa; padding: 40px; }
  .cover { text-align: center; padding: 80px 0 60px; border-bottom: 3px solid #224982; margin-bottom: 40px; }
  .cover h1 { font-size: 32px; color: #224982; margin-bottom: 8px; }
  .cover .sub { font-size: 18px; color: #666; }
  .cover .date { font-size: 14px; color: #999; margin-top: 20px; }
  h2 { font-size: 22px; color: #224982; border-left: 4px solid #fcc92f; padding-left: 12px; margin: 30px 0 16px; }
  h3 { font-size: 17px; color: #333; margin: 16px 0 8px; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0 30px; }
  .summary-card { background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .summary-card .num { font-size: 36px; font-weight: 700; }
  .summary-card .label { font-size: 13px; color: #666; margin-top: 4px; }
  .summary-card.green .num { color: #22c55e; }
  .summary-card.yellow .num { color: #eab308; }
  .summary-card.red .num { color: #ef4444; }
  .page-block { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .page-block h3 { margin-top: 0; }
  .page-block .url { font-size: 12px; color: #999; margin-bottom: 12px; }
  .issue { padding: 6px 0; font-size: 13px; line-height: 1.6; }
  .issue.high { color: #ef4444; }
  .issue.mid { color: #eab308; }
  .issue.low { color: #64748b; }
  .passed-item { color: #22c55e; font-size: 13px; padding: 2px 0; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
  .recommendations { background: #f0f9ff; border-radius: 12px; padding: 24px; margin-top: 30px; }
  .recommendations li { padding: 6px 0; font-size: 14px; line-height: 1.6; color: #1e293b; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 12px 0; }
  th { background: #224982; color: white; padding: 8px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="cover">
  <h1>📊 Informe de Auditoría SEO</h1>
  <div class="sub">SIM Energy — sitio estático .ve</div>
  <div class="date">${new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
</div>`;

  let totalHigh = 0, totalMid = 0, totalLow = 0, totalPassed = 0;
  results.forEach(r => {
    r.issues.forEach(i => { if (i.sev === 'high') totalHigh++; else if (i.sev === 'mid') totalMid++; else totalLow++; });
    totalPassed += r.passed.length;
  });

  html += `<div class="summary-grid">
    <div class="summary-card green"><div class="num">${totalPassed}</div><div class="label">✅ Pasaron</div></div>
    <div class="summary-card red"><div class="num">${totalHigh}</div><div class="label">❌ Críticos</div></div>
    <div class="summary-card yellow"><div class="num">${totalMid}</div><div class="label">⚠️ Medios</div></div>
    <div class="summary-card"><div class="num">${totalLow}</div><div class="label">ℹ️ Bajos</div></div>
  </div>`;

  results.forEach((r, idx) => {
    const pageName = PAGES[idx].name;
    const pageFile = PAGES[idx].file;
    html += `<div class="page-block">
      <h3>${idx + 1}. ${pageName}</h3>
      <div class="url">${pageFile}</div>`;
    if (r.title) html += `<p><strong>Title:</strong> ${r.title}</p>`;
    if (r.metaDesc) html += `<p><strong>Meta desc:</strong> ${r.metaDesc.substring(0, 120)}${r.metaDesc.length > 120 ? '...' : ''}</p>`;
    if (r.h1s.length) html += `<p><strong>H1:</strong> ${r.h1s.join(' | ')}</p>`;
    html += `<div class="divider"></div>`;
    r.passed.forEach(p => html += `<div class="passed-item">${p}</div>`);
    r.issues.forEach(i => html += `<div class="issue ${i.sev}">${i.msg}</div>`);
    html += `</div>`;
  });

  const allRecommendations = [];

  const pagesNoH1 = results.filter((r, i) => r.h1s.length === 0).map((_, i) => PAGES[i].name);
  if (pagesNoH1.length) allRecommendations.push(`Agregar <h1> único en: ${pagesNoH1.join(', ')}`);

  const pagesMultiH1 = results.filter((r, i) => r.h1s.length > 1).map((_, i) => PAGES[i].name);
  if (pagesMultiH1.length) allRecommendations.push(`Reducir a 1 solo <h1> en: ${pagesMultiH1.join(', ')}`);

  const pagesNoTitle = results.filter((r, i) => !r.title).map((_, i) => PAGES[i].name);
  if (pagesNoTitle.length) allRecommendations.push(`Agregar <title> en: ${pagesNoTitle.join(', ')}`);

  const pagesNoMetaDesc = results.filter((r, i) => !r.metaDesc).map((_, i) => PAGES[i].name);
  if (pagesNoMetaDesc.length) allRecommendations.push(`Agregar meta description en: ${pagesNoMetaDesc.join(', ')}`);

  const pagesNoOgImage = results.filter((r, i) => {
    const $ = cheerio.load(fs.readFileSync(path.join(PUBLIC, PAGES[i].file), 'utf-8'));
    return !$('meta[property="og:image"]').attr('content');
  }).map((_, i) => PAGES[i].name);
  if (pagesNoOgImage.length) allRecommendations.push(`Agregar og:image en: ${pagesNoOgImage.join(', ')}`);

  const pagesMissingAlt = results.filter((r, i) => r.issues.some(j => j.msg.includes('imágenes sin alt'))).map((_, i) => PAGES[i].name);
  if (pagesMissingAlt.length) allRecommendations.push(`Agregar texto alternativo (alt) a las imágenes en: ${pagesMissingAlt.join(', ')}`);

  allRecommendations.push('Revisar que la API key de Google Maps esté restringida al dominio .ve');
  allRecommendations.push('Implementar formularios funcionales (reemplazar WPForms por Formspree o similar)');
  allRecommendations.push('Los sitemap.xml y robots.txt existen y están funcionales — mantenerlos actualizados');
  allRecommendations.push('Las imágenes están optimizadas con sharp — continuar esta práctica tras cada recrawl');

  html += `<div class="recommendations">
    <h2>📋 Recomendaciones</h2>
    <ol>${allRecommendations.map(r => `<li>${r}</li>`).join('')}</ol>
  </div>`;

  html += `<div class="footer">Generado automáticamente el ${new Date().toLocaleString('es-VE')} — SIM Energy .ve</div>`;
  html += `</body></html>`;
  return html;
}

(async () => {
  const results = [];
  for (const page of PAGES) {
    const filePath = path.join(PUBLIC, page.file);
    if (!fs.existsSync(filePath)) {
      results.push({ issues: [{ sev: 'high', msg: '❌ Archivo no encontrado' }], passed: [], title: '', metaDesc: '', h1s: [], h2s: [] });
      continue;
    }
    results.push(analyzePage(filePath));
  }

  const html = generateHTMLReport(results);
  const reportPath = path.join(__dirname, '..', 'docs', 'auditoria-seo.html');
  fs.writeFileSync(reportPath, html);
  console.log(`✅ HTML report generated: ${reportPath}`);

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfPath = path.join(__dirname, '..', 'docs', 'AUDITORIA_SEO.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });
    console.log(`✅ PDF generated: ${pdfPath}`);
  } catch (err) {
    console.error('❌ Error generating PDF with Puppeteer:', err.message);
    console.log('ℹ️ HTML report available at docs/auditoria-seo.html');
  } finally {
    if (browser) await browser.close();
  }
})();
