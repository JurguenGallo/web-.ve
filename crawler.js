const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.simenergy.com.co';
const OUT = path.join(__dirname, 'sitio-estatico');
const visited = new Set();
const toVisit = [BASE + '/'];
const downloadedAssets = new Set();

async function crawl() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // Save all assets as they load
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().startsWith(BASE)) req.continue();
    else req.abort();
  });
  page.on('response', async (res) => {
    const url = res.url();
    if (!url.startsWith(BASE)) return;
    if (downloadedAssets.has(url)) return;

    const contentType = res.headers()['content-type'] || '';
    if (!contentType.match(/css|javascript|image|font/)) return;

    downloadedAssets.add(url);
    try {
      const parsed = new URL(url);
      let filePath = path.join(OUT, parsed.hostname, parsed.pathname);
      if (!path.extname(filePath) || filePath.endsWith('/')) filePath = path.join(filePath, 'index.html');
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });
      const buffer = await res.buffer();
      fs.writeFileSync(filePath, buffer);
    } catch(e) {} // ignore asset errors
  });

  let count = 0;
  while (toVisit.length > 0 && count < 30) {
    await new Promise(r => setTimeout(r, 1000));
    const url = toVisit.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      console.log(`\n[${count+1}] Pagina: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      } catch(e) {
        console.log(`  Navigate warning: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 3000));

      // Save HTML
      const html = await page.content();
      const parsed = new URL(url);
      let filePath = path.join(OUT, parsed.hostname, parsed.pathname.replace(/\/$/, '') || '');
      if (!filePath.endsWith('.html')) filePath = path.join(filePath, 'index.html');
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, html);

      // Extract new links
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(a => a.href);
      });

      for (const link of links) {
        if (link.startsWith(BASE) && !visited.has(link) && !toVisit.includes(link)) {
          const p = new URL(link).pathname;
          if (!p.match(/\.(zip|pdf|doc|xls|xml|rss|json)$/) && !p.match(/wp-(admin|login|json)/)) {
            toVisit.push(link);
          }
        }
      }

      count++;
    } catch(pageErr) {
      console.log(`  Page error: ${pageErr.message}`);
      // Still try to save whatever HTML we have
    }
  }

  await browser.close();
  console.log(`\n=== COMPLETADO ===`);
  console.log(`Paginas: ${visited.size}`);
  console.log(`Assets: ${downloadedAssets.size}`);
}

crawl().catch(console.error);
