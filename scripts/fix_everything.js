const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'sitio-estatico', 'www.simenergy.com.co');

// 1. Rename the cache directory
const oldCacheDir = path.join(rootDir, 'wp-content', 'cache', 'background-css', '1', 'www.simenergy.com.co');
const newCacheDir = path.join(rootDir, 'wp-content', 'cache', 'background-css', '1', 'www.simenergy.com.ve');

if (fs.existsSync(oldCacheDir)) {
  fs.renameSync(oldCacheDir, newCacheDir);
  console.log(`Renamed cache dir to .ve`);
}

// 2. Process all files to fix paths
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
  if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // First, ensure all .co are converted to .ve in css/js files (html was already done)
    if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      content = content.replace(/simenergy\.com\.co/g, 'simenergy.com.ve');
    }

    // Replace absolute URLs to wp-content and wp-includes with root-relative paths
    content = content.replace(/https:\/\/www\.simenergy\.com\.ve\/wp-content\//g, '/wp-content/');
    content = content.replace(/https:\/\/www\.simenergy\.com\.ve\/wp-includes\//g, '/wp-includes/');
    
    // Also handle escaped versions in inline scripts
    content = content.replace(/https:\\\/\\\/www\.simenergy\.com\.ve\\\/wp-content\\\//g, '\\/wp-content\\/');
    content = content.replace(/https:\\\/\\\/www\.simenergy\.com\.ve\\\/wp-includes\\\//g, '\\/wp-includes\\/');
    
    // Some preload links might have just //www...
    content = content.replace(/\/\/www\.simenergy\.com\.ve\/wp-content\//g, '/wp-content/');
    
    // For CSS url()
    content = content.replace(/url\(['"]?https:\/\/www\.simenergy\.com\.ve\//g, 'url(\'/');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`Finished processing. Modified ${modifiedFiles} files.`);
