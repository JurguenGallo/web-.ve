const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.html')) {
      let html = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      const navRegex = /<ul id="top-menu"[\s\S]*?<\/ul>/g;

      html = html.replace(navRegex, (navMatch) => {
        const replaceRegex = /<a href="[^"]*">Inicio<\/a>/g;
        if (replaceRegex.test(navMatch)) {
          changed = true;
          return navMatch.replace(replaceRegex, '<a href="/">Inicio</a>');
        }
        return navMatch;
      });

      const mobileRegex = /<ul id="mobile_menu1"[\s\S]*?<\/ul>/g;
      html = html.replace(mobileRegex, (navMatch) => {
        const replaceRegex = /<a href="[^"]*">Inicio<\/a>/g;
        if (replaceRegex.test(navMatch)) {
          changed = true;
          return navMatch.replace(replaceRegex, '<a href="/">Inicio</a>');
        }
        return navMatch;
      });

      if (changed) {
        fs.writeFileSync(fullPath, html, 'utf8');
        console.log(`Fixed Inicio link in: ${fullPath.replace(publicDir, '')}`);
      }
    }
  }
}

processDirectory(publicDir);
console.log('Global Inicio link fix completed.');
