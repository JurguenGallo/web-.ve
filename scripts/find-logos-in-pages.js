const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');

function searchDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDirectory(fullPath);
    } else if (file === 'index.html') {
      const html = fs.readFileSync(fullPath, 'utf8');
      if (html.includes('Siemens-S.A.-10.png')) {
        console.log(`Found Siemens logo in: ${fullPath.replace(publicDir, '')}`);
      }
    }
  }
}

searchDirectory(publicDir);
