const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const targetDir = path.join(__dirname, 'sitio-estatico', 'www.simenergy.com.co');

walkDir(targetDir, (filePath) => {
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('simenergy.com.co')) {
      let updated = content.replace(/simenergy\.com\.co/g, 'simenergy.com.ve');
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`Updated domains in: ${filePath}`);
    }
  }
});
