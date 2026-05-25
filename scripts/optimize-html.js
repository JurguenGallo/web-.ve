const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

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

(async () => {
  for (const file of htmlFiles) {
    try {
      const html = fs.readFileSync(file, 'utf8');
      const minified = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
      });

      fs.writeFileSync(file, minified, 'utf8');
      console.log(`Minified: ${path.relative(SITE_DIR, file)}`);
    } catch (err) {
      console.error(`Error minifying ${file}:`, err);
    }
  }
  console.log('HTML Optimization complete!');
})();
