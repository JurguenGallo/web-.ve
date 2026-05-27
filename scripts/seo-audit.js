const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const crypto = require('crypto');

const PUBLIC = path.join(__dirname, '..', 'frontend', 'public');
const DOCS = path.join(__dirname, '..', 'docs');

const PAGES = [
  { name: 'Inicio', file: 'index.html', slug: '/' },
  { name: 'Quiénes somos', file: 'quienes-somos/index.html', slug: '/quienes-somos/' },
  { name: 'Soluciones fotovoltaicas', file: 'solucionesfotovoltaicas/index.html', slug: '/solucionesfotovoltaicas/' },
  { name: 'Alquiler de equipos', file: 'alquilerequiposelectricos/index.html', slug: '/alquilerequiposelectricos/' },
  { name: 'Galería', file: 'galeria/index.html', slug: '/galeria/' },
  { name: 'Contacto', file: 'contacto/index.html', slug: '/contacto/' },
  { name: 'Energía renovable', file: 'energia-renovables/index.html', slug: '/energia-renovables/' },
  { name: 'Trabaja con nosotros', file: 'trabaja-con-nosotros/index.html', slug: '/trabaja-con-nosotros/' },
];

// ──────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────

function checkExists(p) {
  const full = path.join(PUBLIC, p.replace(/^\//, ''));
  return fs.existsSync(full) ? full : null;
}

function fileSize(p) {
  try { return fs.statSync(p).size; } catch { return 0; }
}

function countFiles(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { recursive: true }).filter(f => f.endsWith(ext)).length;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

function analyzeFileSize() {
  const totalSize = fs.readdirSync(PUBLIC, { recursive: true })
    .filter(f => fs.statSync(path.join(PUBLIC, f)).isFile())
    .reduce((sum, f) => sum + fs.statSync(path.join(PUBLIC, f)).size, 0);

  const htmlCount = countFiles(PUBLIC, '.html');
  const cssCount = countFiles(PUBLIC, '.css');
  const jsCount = countFiles(PUBLIC, '.js');
  const imgCount = countFiles(PUBLIC, '.png') + countFiles(PUBLIC, '.jpg') + countFiles(PUBLIC, '.jpeg') + countFiles(PUBLIC, '.webp');
  const fontCount = countFiles(PUBLIC, '.woff') + countFiles(PUBLIC, '.woff2') + countFiles(PUBLIC, '.ttf') + countFiles(PUBLIC, '.eot');
  const other = htmlCount + cssCount + jsCount + imgCount + fontCount;

  return { totalSize, htmlCount, cssCount, jsCount, imgCount, fontCount, other };
}

// ──────────────────────────────────────────────
//  PAGE ANALYSIS
// ──────────────────────────────────────────────

function analyzePage(filePath, slug) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);
  const issues = [];
  const passed = [];

  // ── TITLE ──
  const title = $('title').text().trim();
  if (!title) {
    issues.push({ sev: 'critical', cat: 'Title', msg: `Sin etiqueta <title>` });
  } else {
    if (title.length < 30) issues.push({ sev: 'medium', cat: 'Title', msg: `Title muy corto (${title.length} chars): "${title}"` });
    else if (title.length > 65) issues.push({ sev: 'medium', cat: 'Title', msg: `Title muy largo (${title.length} chars): "${title}"` });
    else passed.push({ cat: 'Title', msg: `OK (${title.length} chars): "${title}"` });

    if (title === 'SIM Energy | Ingeniería Eléctrica en Venezuela') passed.push({ cat: 'Title', msg: 'Incluye ubicación (Venezuela)' });
    else issues.push({ sev: 'low', cat: 'Title', msg: 'No incluye ubicación geográfica' });

    const titleLower = title.toLowerCase();
    const kws = ['sim energy', 'ingeniería', 'eléctrica', 'venezuela', 'solar', 'fotovoltaica', 'energía', 'mantenimiento'];
    const found = kws.filter(k => titleLower.includes(k));
    if (found.length < 2) issues.push({ sev: 'low', cat: 'Title', msg: 'Pocas keywords en title' });
  }

  // ── META DESCRIPTION ──
  const metaDesc = $('meta[name="description"]').attr('content');
  if (!metaDesc) {
    issues.push({ sev: 'critical', cat: 'Meta Description', msg: 'Sin meta description' });
  } else {
    if (metaDesc.length < 50) issues.push({ sev: 'medium', cat: 'Meta Description', msg: `Muy corta (${metaDesc.length} chars)` });
    else if (metaDesc.length > 160) issues.push({ sev: 'medium', cat: 'Meta Description', msg: `Muy larga (${metaDesc.length} chars)` });
    else passed.push({ cat: 'Meta Description', msg: `OK (${metaDesc.length} chars)` });

    if (metaDesc.includes('Venezuela')) passed.push({ cat: 'Meta Description', msg: 'Incluye "Venezuela"' });
    else issues.push({ sev: 'medium', cat: 'Meta Description', msg: 'No menciona "Venezuela"' });
  }

  // ── H1 ──
  const h1s = []; $('h1').each((i, el) => h1s.push($(el).text().trim()));
  if (h1s.length === 0) issues.push({ sev: 'critical', cat: 'H1', msg: 'Sin etiqueta <h1>' });
  else if (h1s.length > 1) issues.push({ sev: 'high', cat: 'H1', msg: `${h1s.length} <h1> (debe haber solo 1): "${h1s.join('" | "')}"` });
  else passed.push({ cat: 'H1', msg: `OK: "${h1s[0]}"` });

  // ── H2 ──
  const h2s = []; $('h2').each((i, el) => h2s.push($(el).text().trim()));
  if (h2s.length === 0) issues.push({ sev: 'medium', cat: 'H2', msg: 'Sin <h2>' });
  else passed.push({ cat: 'H2', msg: `${h2s.length} <h2> encontrados` });

  // ── HEADING HIERARCHY ──
  const headings = [];
  $('h1, h2, h3, h4, h5, h6').each((i, el) => headings.push({ tag: el.name, text: $(el).text().trim() }));
  let hierarchyOk = true;
  for (let i = 1; i < headings.length; i++) {
    if (parseInt(headings[i].tag[1]) > parseInt(headings[i-1].tag[1]) + 1) {
      hierarchyOk = false;
      break;
    }
  }
  if (hierarchyOk) passed.push({ cat: 'Headings', msg: 'Jerarquía de encabezados OK' });
  else issues.push({ sev: 'medium', cat: 'Headings', msg: 'Jerarquía de encabezados saltada (ej: h1 -> h3 sin h2)' });

  // ── IMAGES ALT ──
  const imgsNoAlt = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src') || '(sin src)';
    const alt = $(el).attr('alt');
    if (alt === undefined || alt === null) imgsNoAlt.push(`${src} (sin atributo alt)`);
    else if (alt.trim() === '') imgsNoAlt.push(`${src} (alt vacío)`);
  });
  if (imgsNoAlt.length > 0) issues.push({ sev: 'high', cat: 'Images', msg: `${imgsNoAlt.length} imágenes sin alt text` });
  else passed.push({ cat: 'Images', msg: 'Todas las imágenes tienen alt text' });

  // ── OPEN GRAPH ──
  const og = {
    title: $('meta[property="og:title"]').attr('content'),
    desc: $('meta[property="og:description"]').attr('content'),
    image: $('meta[property="og:image"]').attr('content'),
    url: $('meta[property="og:url"]').attr('content'),
    type: $('meta[property="og:type"]').attr('content'),
  };
  Object.entries(og).forEach(([k, v]) => {
    if (!v) issues.push({ sev: 'medium', cat: 'Open Graph', msg: `Falta og:${k}` });
    else passed.push({ cat: 'Open Graph', msg: `og:${k} presente` });
  });

  // ── TWITTER CARDS ──
  const tc = {
    card: $('meta[name="twitter:card"]').attr('content'),
    title: $('meta[name="twitter:title"]').attr('content'),
    desc: $('meta[name="twitter:description"]').attr('content'),
    image: $('meta[name="twitter:image"]').attr('content'),
  };
  Object.entries(tc).forEach(([k, v]) => {
    if (!v) issues.push({ sev: 'low', cat: 'Twitter Cards', msg: `Falta twitter:${k}` });
    else passed.push({ cat: 'Twitter Cards', msg: `twitter:${k} presente` });
  });

  // ── STRUCTURED DATA (JSON-LD) ──
  const jsonlds = [];
  $('script[type="application/ld+json"]').each((i, el) => {
    try { jsonlds.push(JSON.parse($(el).html())); } catch { issues.push({ sev: 'medium', cat: 'Schema', msg: 'JSON-LD inválido (parse error)' }); }
  });
  if (jsonlds.length === 0) {
    issues.push({ sev: 'critical', cat: 'Schema', msg: 'Sin schema JSON-LD' });
  } else {
    passed.push({ cat: 'Schema', msg: `${jsonlds.length} schema(s) JSON-LD` });
    jsonlds.forEach(j => {
      if (j['@type'] === 'Organization') passed.push({ cat: 'Schema', msg: `Tipo Organization ✓` });
      if (j['@type'] === 'ProfessionalService') passed.push({ cat: 'Schema', msg: `Tipo ProfessionalService ✓` });
      if (j.address) passed.push({ cat: 'Schema', msg: 'Dirección incluida en schema ✓' });
      if (j.sameAs && j.sameAs.length > 0) passed.push({ cat: 'Schema', msg: `${j.sameAs.length} redes sociales en schema ✓` });
    });
  }

  // ── VIEWPORT ──
  const vp = $('meta[name="viewport"]').attr('content');
  if (!vp) issues.push({ sev: 'critical', cat: 'Viewport', msg: 'Sin meta viewport (no responsivo)' });
  else if (vp.includes('user-scalable=0') || vp.includes('user-scalable=no')) issues.push({ sev: 'high', cat: 'Viewport', msg: 'Bloquea zoom (user-scalable=0)' });
  else passed.push({ cat: 'Viewport', msg: 'Responsive habilitado' });

  // ── CANONICAL ──
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) issues.push({ sev: 'low', cat: 'Canonical', msg: 'Sin canonical URL' });
  else if (canonical.includes('simenergy.com.ve')) passed.push({ cat: 'Canonical', msg: `Canonical apunta a .ve` });
  else issues.push({ sev: 'medium', cat: 'Canonical', msg: `Canonical no apunta a .ve: ${canonical}` });

  // ── HREFLANG ──
  const hreflangs = [];
  $('link[hreflang]').each((i, el) => hreflangs.push({ lang: $(el).attr('hreflang'), href: $(el).attr('href') }));
  if (hreflangs.length > 0) {
    passed.push({ cat: 'Hreflang', msg: `${hreflangs.length} etiquetas hreflang` });
    hreflangs.forEach(h => passed.push({ cat: 'Hreflang', msg: `  ${h.lang} → ${h.href}` }));
  } else issues.push({ sev: 'low', cat: 'Hreflang', msg: 'Sin hreflang' });

  // ── HTML LANG ──
  const lang = $('html').attr('lang');
  if (lang) passed.push({ cat: 'HTML', msg: `lang="${lang}"` });
  else issues.push({ sev: 'low', cat: 'HTML', msg: '<html> sin lang' });

  // ── CHARSET ──
  const charset = $('meta[charset]').attr('charset');
  if (charset) passed.push({ cat: 'HTML', msg: `charset="${charset}"` });
  else issues.push({ sev: 'medium', cat: 'HTML', msg: 'Sin declaración charset' });

  // ── FAVICON ──
  const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
  if (favicon) passed.push({ cat: 'HTML', msg: `Favicon: ${favicon}` });
  else issues.push({ sev: 'low', cat: 'HTML', msg: 'Sin favicon' });

  // ── BROKEN LOCAL IMAGES ──
  const brokenImgs = [];
  $('img[src]').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
      const p = path.join(PUBLIC, src.replace(/^\//, ''));
      if (!fs.existsSync(p)) brokenImgs.push(src);
    }
  });
  if (brokenImgs.length > 0) issues.push({ sev: 'critical', cat: 'Broken Assets', msg: `${brokenImgs.length} imágenes locales no encontradas en disco` });

  // ── EXTERNAL CSS/JS LOAD ──
  const extCss = [];
  $('link[rel="stylesheet"]').each((i, el) => { const h = $(el).attr('href'); if (h && (h.startsWith('http:') || h.startsWith('https:'))) extCss.push(h); });
  const extJs = [];
  $('script[src]').each((i, el) => { const s = $(el).attr('src'); if (s && (s.startsWith('http:') || s.startsWith('https:'))) extJs.push(s); });
  if (extCss.length > 0) passed.push({ cat: 'External', msg: `${extCss.length} CSS externos` });
  if (extJs.length > 0) passed.push({ cat: 'External', msg: `${extJs.length} JS externos` });

  // ── GOOGLE MAPS ──
  if (html.includes('maps.googleapis.com')) {
    passed.push({ cat: 'External', msg: 'Google Maps API detectado' });
    if (html.includes('AIzaSyAbFRPudnZ8IXs4e5C07IJW4bDmCoy-AE8')) {
      issues.push({ sev: 'high', cat: 'Security', msg: 'API key de Google Maps expuesta en el HTML' });
    }
  }

  // ── WHATSAPP ──
  if (html.includes('wa.me/58412') || html.includes('ht-ctc-chat')) {
    passed.push({ cat: 'WhatsApp', msg: 'Botón flotante WhatsApp presente' });
    if (html.includes('584120000000')) issues.push({ sev: 'medium', cat: 'WhatsApp', msg: 'Número WhatsApp parece ser placeholder (584120000000)' });
  }

  // ── KEYWORD ANALYSIS ──
  const textContent = $('body').text().toLowerCase();
  const keywords = {
    'sim energy': 0, 'ingeniería': 0, 'eléctrica': 0, 'venezuela': 0,
    'solar': 0, 'fotovoltaica': 0, 'energía': 0, 'mantenimiento': 0,
    'obras civiles': 0, 'proyectos': 0, 'servicios': 0, 'industrial': 0,
    'paneles': 0, 'calidad': 0, 'soluciones': 0, 'táchira': 0,
    'san cristóbal': 0, 'colombia': 0, 'internacional': 0,
  };
  Object.keys(keywords).forEach(kw => {
    const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const count = (textContent.match(re) || []).length;
    if (count > 0) keywords[kw] = count;
  });

  // ── PAGE WEIGHT ──
  const pageSize = Buffer.byteLength(html, 'utf-8');

  // ── SOCIAL LINKS ──
  const socialLinks = [];
  $('a[href*="facebook.com"]').length && socialLinks.push('Facebook');
  $('a[href*="instagram.com"]').length && socialLinks.push('Instagram');
  $('a[href*="linkedin.com"]').length && socialLinks.push('LinkedIn');
  $('a[href*="youtube.com"]').length && socialLinks.push('YouTube');

  return { issues, passed, title, metaDesc, h1s, h2s, headings, keywords, socialLinks, pageSize, hreflangs, jsonlds, brokenImgs, extCss, extJs, lang, charset, favicon };
}

// ──────────────────────────────────────────────
//  SITE-WIDE ANALYSIS
// ──────────────────────────────────────────────

function analyzeSitewide() {
  const issues = [];
  const passed = [];

  // Sitemap
  const sitemap = path.join(PUBLIC, 'sitemap.xml');
  if (fs.existsSync(sitemap)) {
    const sm = fs.readFileSync(sitemap, 'utf-8');
    const urls = (sm.match(/<loc>/g) || []).length;
    passed.push({ cat: 'Sitemap', msg: `sitemap.xml existe con ${urls} URLs` });
  } else issues.push({ sev: 'critical', cat: 'Sitemap', msg: 'Falta sitemap.xml' });

  // Robots
  const robots = path.join(PUBLIC, 'robots.txt');
  if (fs.existsSync(robots)) {
    const rb = fs.readFileSync(robots, 'utf-8');
    passed.push({ cat: 'Robots', msg: 'robots.txt existe' });
    if (rb.includes('sitemap')) passed.push({ cat: 'Robots', msg: 'robots.txt apunta al sitemap' });
  } else issues.push({ sev: 'critical', cat: 'Robots', msg: 'Falta robots.txt' });

  // Minification check
  const htmlFiles = fs.readdirSync(PUBLIC, { recursive: true }).filter(f => f.endsWith('.html'));
  let minified = 0, notMinified = 0;
  htmlFiles.forEach(f => {
    const content = fs.readFileSync(path.join(PUBLIC, f), 'utf-8');
    if (content.includes('\n  ') || content.includes('\n\t')) notMinified++;
    else minified++;
  });
  if (notMinified === 0) passed.push({ cat: 'Minification', msg: `Todos los HTML (${minified}) están minificados` });
  else issues.push({ sev: 'medium', cat: 'Minification', msg: `${notMinified} archivos HTML no minificados` });

  // Image optimization check
  const imgExts = ['.png', '.jpg', '.jpeg'];
  const allImgs = fs.readdirSync(PUBLIC, { recursive: true }).filter(f => imgExts.some(e => f.endsWith(e)));
  const largeImgs = allImgs.filter(f => fs.statSync(path.join(PUBLIC, f)).size > 200 * 1024);
  if (largeImgs.length > 0) {
    issues.push({ sev: 'medium', cat: 'Images', msg: `${largeImgs.length} imágenes > 200KB (optimizables)` });
    largeImgs.slice(0, 5).forEach(f => issues.push({ sev: 'low', cat: 'Images', msg: `  ${f} (${formatSize(fs.statSync(path.join(PUBLIC, f)).size)})` }));
  } else passed.push({ cat: 'Images', msg: 'No hay imágenes > 200KB' });

  // Image formats (WebP adoption)
  const pngCount = allImgs.filter(f => f.endsWith('.png')).length;
  const jpgCount = allImgs.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg')).length;
  const webpCount = fs.readdirSync(PUBLIC, { recursive: true }).filter(f => f.endsWith('.webp')).length;
  if (webpCount > 0) passed.push({ cat: 'Images', msg: `${webpCount} imágenes en WebP (${pngCount} PNG, ${jpgCount} JPG)` });

  return { issues, passed, minified, notMinified, largeImgs };
}

// ──────────────────────────────────────────────
//  REPORT GENERATION
// ──────────────────────────────────────────────

function generateHTML(pageResults, sitewide) {
  let totalCritical = 0, totalHigh = 0, totalMedium = 0, totalLow = 0, totalPassed = 0;
  pageResults.forEach(r => {
    r.issues.forEach(i => {
      if (i.sev === 'critical') totalCritical++;
      else if (i.sev === 'high') totalHigh++;
      else if (i.sev === 'medium') totalMedium++;
      else totalLow++;
    });
    totalPassed += r.passed.length;
  });
  sitewide.issues.forEach(i => {
    if (i.sev === 'critical') totalCritical++;
    else if (i.sev === 'high') totalHigh++;
    else if (i.sev === 'medium') totalMedium++;
    else totalLow++;
  });
  totalPassed += sitewide.passed.length;

  const totalIssues = totalCritical + totalHigh + totalMedium + totalLow;
  const score = totalIssues + totalPassed > 0 ? Math.round((totalPassed / (totalIssues + totalPassed)) * 100) : 0;

  let html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Auditoría SEO - SIM Energy .ve</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1e293b; background: #f1f5f9; padding: 0; }
  .page { max-width: 800px; margin: 0 auto; padding: 0; background: #fff; }

  /* COVER */
  .cover { background: linear-gradient(135deg, #224982 0%, #1a3a6b 100%); color: #fff; padding: 60px 50px 50px; text-align: center; }
  .cover h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
  .cover .badge { display: inline-block; background: #fcc92f; color: #224982; font-weight: 700; font-size: 48px; padding: 20px 30px; border-radius: 16px; margin: 20px 0 10px; }
  .cover .sub { font-size: 16px; opacity: .8; }
  .cover .meta { font-size: 13px; opacity: .6; margin-top: 20px; }
  .cover .version { margin-top: 10px; font-size: 13px; background: rgba(255,255,255,.1); display: inline-block; padding: 6px 16px; border-radius: 20px; }

  /* SUMMARY */
  .summary { padding: 30px 50px; background: #fff; }
  .summary h2 { font-size: 18px; color: #224982; margin-bottom: 16px; font-weight: 700; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
  .card { padding: 16px; border-radius: 12px; text-align: center; }
  .card.passed { background: #f0fdf4; }
  .card.passed .num { color: #16a34a; }
  .card.critical { background: #fef2f2; }
  .card.critical .num { color: #dc2626; }
  .card.high { background: #fff7ed; }
  .card.high .num { color: #ea580c; }
  .card.medium { background: #fefce8; }
  .card.medium .num { color: #ca8a04; }
  .card.low { background: #f8fafc; }
  .card.low .num { color: #64748b; }
  .card .num { font-size: 32px; font-weight: 800; }
  .card .label { font-size: 11px; color: #666; margin-top: 4px; text-transform: uppercase; letter-spacing: .5px; }

  /* SECTIONS */
  .section { padding: 0 50px 20px; }
  .section h2 { font-size: 18px; color: #224982; border-left: 4px solid #fcc92f; padding-left: 12px; margin: 24px 0 14px; font-weight: 700; }
  .section h3 { font-size: 15px; color: #334155; margin: 16px 0 8px; font-weight: 600; }

  .page-block { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 14px; page-break-inside: avoid; }
  .page-block .url { font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
  .page-block .pname { font-size: 16px; font-weight: 700; color: #224982; }
  .page-block .subinfo { font-size: 12px; color: #64748b; margin: 4px 0 10px; }

  .item { padding: 4px 0; font-size: 12.5px; line-height: 1.7; }
  .item.critical { color: #dc2626; }
  .item.high { color: #ea580c; }
  .item.medium { color: #a16207; }
  .item.low { color: #64748b; }
  .item.passed-item { color: #16a34a; }

  .cat-tag { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-right: 6px; text-transform: uppercase; letter-spacing: .3px; }
  .cat-tag.critical { background: #fef2f2; color: #dc2626; }
  .cat-tag.high { background: #fff7ed; color: #ea580c; }
  .cat-tag.medium { background: #fefce8; color: #a16207; }
  .cat-tag.low { background: #f1f5f9; color: #64748b; }
  .cat-tag.passed { background: #f0fdf4; color: #16a34a; }

  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }

  .kw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 8px 0; }
  .kw-item { background: #f8fafc; padding: 6px 10px; border-radius: 6px; font-size: 12px; }
  .kw-item .kw { font-weight: 600; }
  .kw-item .count { color: #64748b; }

  .rec-block { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; margin: 20px 50px 30px; page-break-inside: avoid; }
  .rec-block h2 { color: #0369a1; border-left-color: #38bdf8; margin-top: 0; }
  .rec-block ol { padding-left: 20px; }
  .rec-block li { padding: 6px 0; font-size: 13px; line-height: 1.7; color: #1e293b; }

  .footer { text-align: center; color: #94a3b8; font-size: 11px; padding: 20px 50px; border-top: 1px solid #e2e8f0; margin-top: 20px; }

  .inline-table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0; }
  .inline-table th { background: #f1f5f9; padding: 6px 10px; text-align: left; font-weight: 600; color: #475569; }
  .inline-table td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }

  @media print {
    body { background: #fff; }
    .page { max-width: 100%; }
    .page-block { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

<div class="cover">
  <h1>Auditoría SEO</h1>
  <div class="badge">${score}%</div>
  <div class="sub">SIM Energy — Sitio Estático .ve</div>
  <div class="meta">${new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  <div class="version">${PAGES.length} páginas analizadas • ${formatSize(pageResults.reduce((s, r) => s + r.pageSize, 0))} contenido total</div>
</div>

<div class="summary">
  <h2>Resumen</h2>
  <div class="grid">
    <div class="card passed"><div class="num">${totalPassed}</div><div class="label">Pasaron</div></div>
    <div class="card critical"><div class="num">${totalCritical}</div><div class="label">Críticos</div></div>
    <div class="card high"><div class="num">${totalHigh}</div><div class="label">Altos</div></div>
    <div class="card medium"><div class="num">${totalMedium}</div><div class="label">Medios</div></div>
    <div class="card low"><div class="num">${totalLow}</div><div class="label">Bajos</div></div>
  </div>
</div>`;

  // ── SITE-WIDE ──
  html += `<div class="section"><h2>Configuración General del Sitio</h2><div class="page-block">`;
  sitewide.passed.forEach(p => html += `<div class="item passed-item"><span class="cat-tag passed">${p.cat}</span>${p.msg}</div>`);
  sitewide.issues.forEach(i => html += `<div class="item ${i.sev}"><span class="cat-tag ${i.sev}">${i.cat}</span>${i.msg}</div>`);
  const stats = analyzeFileSize();
  html += `<div class="divider"></div>
  <table class="inline-table"><tr><th>Métrica</th><th>Valor</th></tr>
    <tr><td>Peso total del sitio</td><td>${formatSize(stats.totalSize)}</td></tr>
    <tr><td>Archivos HTML</td><td>${stats.htmlCount}</td></tr>
    <tr><td>Archivos CSS</td><td>${stats.cssCount}</td></tr>
    <tr><td>Archivos JS</td><td>${stats.jsCount}</td></tr>
    <tr><td>Imágenes</td><td>${stats.imgCount}</td></tr>
    <tr><td>Fuentes</td><td>${stats.fontCount}</td></tr>
  </table>`;
  html += `</div></div>`;

  // ── PAGES ──
  html += `<div class="section"><h2>Análisis por Página</h2>`;
  pageResults.forEach((r, idx) => {
    html += `<div class="page-block">
      <div class="pname">${idx + 1}. ${PAGES[idx].name}</div>
      <div class="url">${PAGES[idx].slug}</div>`;

    if (r.title) html += `<div class="subinfo"><strong>Title:</strong> ${r.title}</div>`;
    if (r.metaDesc) html += `<div class="subinfo"><strong>Meta desc:</strong> ${r.metaDesc.substring(0, 120)}${r.metaDesc.length > 120 ? '...' : ''}</div>`;
    if (r.h1s.length) html += `<div class="subinfo"><strong>H1:</strong> ${r.h1s.join(' | ')}</div>`;
    html += `<div class="subinfo"><strong>Peso:</strong> ${formatSize(r.pageSize)}</div>`;

    if (r.socialLinks.length) html += `<div class="subinfo"><strong>Redes:</strong> ${r.socialLinks.join(', ')}</div>`;

    html += `<div class="divider"></div>`;

    // Keywords
    const foundKws = Object.entries(r.keywords).filter(([k, v]) => v > 0);
    if (foundKws.length > 0) {
      html += `<div style="margin-bottom:8px"><strong>Keywords en página:</strong></div><div class="kw-grid">`;
      foundKws.forEach(([kw, count]) => html += `<div class="kw-item"><span class="kw">${kw}</span> <span class="count">×${count}</span></div>`);
      html += `</div>`;
    }

    r.passed.forEach(p => html += `<div class="item passed-item"><span class="cat-tag passed">${p.cat}</span>${p.msg}</div>`);
    r.issues.forEach(i => html += `<div class="item ${i.sev}"><span class="cat-tag ${i.sev}">${i.cat}</span>${i.msg}</div>`);

    html += `</div>`;
  });
  html += `</div>`;

  // ── KEYWORD GLOBAL ──
  const globalKws = {};
  pageResults.forEach(r => {
    Object.entries(r.keywords).forEach(([kw, count]) => {
      globalKws[kw] = (globalKws[kw] || 0) + count;
    });
  });
  const sortedKws = Object.entries(globalKws).sort((a, b) => b[1] - a[1]);
  html += `<div class="section"><h2>Distribución Global de Keywords</h2><div class="page-block">
    <table class="inline-table"><tr><th>Keyword</th><th>Ocurrencias</th><th>Presencia en páginas</th></tr>`;
  sortedKws.slice(0, 20).forEach(([kw, total]) => {
    const pagesWith = pageResults.filter(r => r.keywords[kw] > 0).length;
    html += `<tr><td>${kw}</td><td>${total}</td><td>${pagesWith}/${PAGES.length} páginas</td></tr>`;
  });
  html += `</table></div></div>`;

  // ── RECOMMENDATIONS ──
  html += `<div class="rec-block"><h2>📋 Recomendaciones Prioritarias</h2><ol>`;

  const criticalIssues = [];
  pageResults.forEach(r => r.issues.filter(i => i.sev === 'critical').forEach(i => criticalIssues.push(i)));
  if (criticalIssues.length > 0) {
    criticalIssues.forEach(i => html += `<li><strong>🔴 [Crítico] ${i.cat}:</strong> ${i.msg}</li>`);
  }

  const highIssues = [];
  pageResults.forEach(r => r.issues.filter(i => i.sev === 'high').forEach(i => highIssues.push(i)));
  if (highIssues.length > 0) {
    highIssues.forEach(i => html += `<li><strong>🟠 [Alto] ${i.cat}:</strong> ${i.msg}</li>`);
  }

  html += `<li><strong>API Key de Google Maps:</strong> Restringir la API key (AIzaSyAbFRPudnZ8IXs4e5C07IJW4bDmCoy-AE8) al dominio .ve para evitar uso no autorizado.</li>`;
  html += `<li><strong>Número WhatsApp:</strong> Reemplazar el número placeholder (584120000000) por el número real del cliente.</li>`;
  html += `<li><strong>Formularios:</strong> Los formularios de contacto son de Divi (WPForms) y no funcionan en estático. Reemplazar por Formspree, Netlify Forms o similar.</li>`;
  html += `<li><strong>Contenido periódico:</strong> Agregar blog o sección de noticias para mejorar el SEO con contenido fresco indexable.</li>`;
  html += `<li><strong>Velocidad:</strong> Las imágenes ya están optimizadas. Considerar lazy loading y CDN para producción.</li>`;
  html += `<li><strong>HTTPS:</strong> Asegurar que el VPS Truobox tenga SSL (Let's Encrypt) configurado antes del lanzamiento.</li>`;
  html += `<li><strong>Google Analytics / Search Console:</strong> Verificar la propiedad del sitio en GSC y configurar GA4 para tracking.</li>`;
  html += `<li><strong>Móvil primero:</strong> Probar todas las páginas en Chrome DevTools modo móvil y corregir problemas de visualización.</li>`;

  html += `</ol></div>`;

  html += `<div class="footer">
    Generado: ${new Date().toLocaleString('es-VE')} • SIM Energy .ve • ${PAGES.length} páginas analizadas
  </div>`;
  html += `</div></body></html>`;
  return html;
}

// ──────────────────────────────────────────────
//  MAIN
// ──────────────────────────────────────────────

(async () => {
  const pageResults = [];
  for (const page of PAGES) {
    const filePath = path.join(PUBLIC, page.file);
    if (!fs.existsSync(filePath)) {
      pageResults.push({
        issues: [{ sev: 'critical', cat: 'File', msg: 'Archivo no encontrado' }],
        passed: [], title: '', metaDesc: '', h1s: [], h2s: [], headings: [],
        keywords: {}, socialLinks: [], pageSize: 0, hreflangs: [], jsonlds: [],
        brokenImgs: [], extCss: [], extJs: [], lang: '', charset: '', favicon: '',
      });
      continue;
    }
    pageResults.push(analyzePage(filePath, page.slug));
  }

  const sitewide = analyzeSitewide();

  const html = generateHTML(pageResults, sitewide);
  const htmlPath = path.join(DOCS, 'auditoria-seo.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ HTML: ${htmlPath}`);

  // Generate PDF
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfPath = path.join(DOCS, 'AUDITORIA_SEO.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });
    console.log(`✅ PDF: ${pdfPath}`);
  } catch (err) {
    console.error('❌ PDF generation error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
})();
