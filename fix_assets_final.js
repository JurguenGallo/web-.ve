const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'sitio-estatico', 'www.simenergy.com.co');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
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

let modifiedFiles = 0;

walkDir(rootDir, (filePath) => {
  if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js') || filePath.endsWith('.json')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace absolute URLs with root-relative paths
    // Handle standard URLs
    content = content.replace(/https:\/\/www\.simenergy\.com\.ve\//g, '/');
    content = content.replace(/http:\/\/www\.simenergy\.com\.ve\//g, '/');
    
    // Handle escaped URLs in JSON or scripts (e.g., https:\/\/www.simenergy.com.ve\/)
    content = content.replace(/https:\\\/\\\/www\.simenergy\.com\.ve\\\//g, '/');
    content = content.replace(/http:\\\/\\\/www\.simenergy\.com\.ve\\\//g, '/');

    // Handle just the domain name if it appears elsewhere without trailing slash
    content = content.replace(/https:\/\/www\.simenergy\.com\.ve/g, '');
    content = content.replace(/https:\\\/\\\/www\.simenergy\.com\.ve/g, '');
    
    // Also fix the .co domains that might still be left
    content = content.replace(/https:\/\/www\.simenergy\.com\.co\//g, '/');
    content = content.replace(/https:\\\/\\\/www\.simenergy\.com\.co\\\//g, '/');
    content = content.replace(/https:\/\/www\.simenergy\.com\.co/g, '');
    content = content.replace(/https:\\\/\\\/www\.simenergy\.com\.co/g, '');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`Finished fixing assets. Modified ${modifiedFiles} files.`);
