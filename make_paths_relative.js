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

let totalFiles = 0;
let modifiedFiles = 0;

walkDir(targetDir, (filePath) => {
  if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
    totalFiles++;
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace absolute URLs with relative root paths
    content = content.replace(/https:\/\/www\.simenergy\.com\.ve\//g, '/');
    content = content.replace(/http:\/\/www\.simenergy\.com\.ve\//g, '/');
    content = content.replace(/\/\/www\.simenergy\.com\.ve\//g, '/');
    
    // Just in case there are still .co domains (since previous script only ran on .html)
    content = content.replace(/https:\/\/www\.simenergy\.com\.co\//g, '/');
    content = content.replace(/http:\/\/www\.simenergy\.com\.co\//g, '/');
    content = content.replace(/\/\/www\.simenergy\.com\.co\//g, '/');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated paths in: ${filePath}`);
      modifiedFiles++;
    }
  }
});

console.log(`\nFinished! Processed ${totalFiles} files. Modified ${modifiedFiles} files.`);
