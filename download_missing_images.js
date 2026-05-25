const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.join(__dirname, 'sitio-estatico', 'www.simenergy.com.co');
const baseUrl = 'https://www.simenergy.com.co';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(dest, () => reject(new Error(`Failed to download ${url}: ${response.statusCode}`)));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

function findMissingUrls(htmlContent) {
  const urls = new Set();
  
  // Find all src="..." and srcset="..."
  const srcRegex = /src=["'](\/wp-[^"']+)["']/g;
  const srcsetRegex = /srcset=["'](\/wp-[^"'\s]+)[^"']*["']/g;
  
  let match;
  while ((match = srcRegex.exec(htmlContent)) !== null) {
    urls.add(match[1]);
  }
  while ((match = srcsetRegex.exec(htmlContent)) !== null) {
    urls.add(match[1]);
  }
  
  // Find url('/wp-...') in inline styles
  const urlRegex = /url\(['"]?(\/wp-[^'"\)]+)['"]?\)/g;
  while ((match = urlRegex.exec(htmlContent)) !== null) {
    urls.add(match[1]);
  }
  
  return Array.from(urls);
}

async function processHtmlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const urls = findMissingUrls(content);
  
  for (const urlPath of urls) {
    // Ignore params like ?ver=...
    const cleanPath = urlPath.split('?')[0];
    const localPath = path.join(rootDir, cleanPath);
    
    if (!fs.existsSync(localPath)) {
      const fullUrl = baseUrl + cleanPath;
      console.log(`Downloading missing file: ${cleanPath}`);
      try {
        await downloadFile(fullUrl, localPath);
        console.log(`Successfully downloaded ${cleanPath}`);
      } catch (err) {
        console.error(`Failed to download ${cleanPath}: ${err.message}`);
      }
    }
  }
}

async function run() {
  const htmlFiles = [
    path.join(rootDir, 'index.html'),
    path.join(rootDir, 'quienes-somos', 'index.html'),
    path.join(rootDir, 'solucionesfotovoltaicas', 'index.html'),
    path.join(rootDir, 'alquilerequiposelectricos', 'index.html'),
    path.join(rootDir, 'galeria', 'index.html'),
    path.join(rootDir, 'contacto', 'index.html')
  ];

  for (const file of htmlFiles) {
    if (fs.existsSync(file)) {
      console.log(`Processing ${file}...`);
      await processHtmlFile(file);
    }
  }
  
  console.log('Finished downloading missing files.');
}

run();
