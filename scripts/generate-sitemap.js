const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..', 'frontend', 'public');
const BASE_URL = 'https://www.simenergy.com.ve';

// List all HTML files relative to SITE_DIR
const getHtmlFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      // Normalize paths to be web-friendly (forward slashes)
      fileList.push(path.relative(SITE_DIR, filePath).split(path.sep).join('/'));
    }
  }
  return fileList;
};

const htmlFiles = getHtmlFiles(SITE_DIR);

// Generate sitemap XML content
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

htmlFiles.forEach(file => {
  // Omit "index.html" from the final URL string for cleaner SEO URLs
  let urlPath = file.replace(/(^|\/)index\.html$/, '$1');
  if (urlPath !== '' && !urlPath.endsWith('/')) {
    urlPath += '/';
  }
  
  const fullUrl = `${BASE_URL}/${urlPath}`;
  
  // Set priority: home page is 1.0, others are 0.8
  const priority = urlPath === '' ? '1.0' : '0.8';

  sitemap += `  <url>\n`;
  sitemap += `    <loc>${fullUrl}</loc>\n`;
  sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
  sitemap += `    <changefreq>monthly</changefreq>\n`;
  sitemap += `    <priority>${priority}</priority>\n`;
  sitemap += `  </url>\n`;
});

sitemap += `</urlset>\n`;

const sitemapPath = path.join(SITE_DIR, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Sitemap generated at: ${sitemapPath} with ${htmlFiles.length} URLs.`);

// Generate robots.txt
const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`;
const robotsPath = path.join(SITE_DIR, 'robots.txt');
fs.writeFileSync(robotsPath, robotsTxt);

console.log(`robots.txt generated at: ${robotsPath}`);
