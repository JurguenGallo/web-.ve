const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// Find background 1 in index.html
const target = 'data-public-id="1"';
const targetIndex = html.indexOf(target);
if (targetIndex !== -1) {
  // Find the next img tag src after targetIndex
  const srcStart = html.indexOf('src="/wp-content/uploads/2025/03/portada-venezuela.png"', targetIndex);
  if (srcStart !== -1 && srcStart < targetIndex + 500) {
    const srcEnd = srcStart + 'src="/wp-content/uploads/2025/03/portada-venezuela.png"'.length;
    console.log("Original src of background 1 matches.");
    
    // Replace it with src="/wp-content/uploads/2026/portada-venezuela/Portada de pagina web.png"
    const newSrcStr = 'src="/wp-content/uploads/2026/portada-venezuela/Portada de pagina web.png"';
    html = html.substring(0, srcStart) + newSrcStr + html.substring(srcEnd);
    
    fs.writeFileSync(indexFile, html, 'utf8');
    console.log("Successfully changed background 1 src to the new 2026 path.");
  } else {
    console.log("Could not find the expected 2025/03/portada-venezuela.png src for background 1");
  }
} else {
  console.log("Could not find background 1 in index.html");
}
