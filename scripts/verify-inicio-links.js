const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');

function checkDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkDirectory(fullPath);
    } else if (file === 'index.html') {
      const html = fs.readFileSync(fullPath, 'utf8');
      const hasOldLink = html.includes('href=""') || html.includes('href="#"') || /<a href="[^"]*">Inicio<\/a>/.test(html);
      
      // Let's count matching "Inicio" links and check their hrefs
      const matches = html.match(/<a[^>]*>Inicio<\/a>/gi) || [];
      console.log(`${fullPath.replace(publicDir, '')}: Found ${matches.length} Inicio links`);
      matches.forEach(m => {
        console.log(`  Link: ${m}`);
      });
    }
  }
}

checkDirectory(publicDir);
