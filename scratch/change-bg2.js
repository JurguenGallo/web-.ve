const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// We want to find the img inside data-public-id="2"
const target = 'data-public-id="2"';
const targetIndex = html.indexOf(target);
if (targetIndex !== -1) {
  // Find the next img tag src after targetIndex
  const srcStart = html.indexOf('src="/wp-content/uploads/2025/03/', targetIndex);
  if (srcStart !== -1) {
    const srcEnd = html.indexOf('"', srcStart + 5);
    const originalSrc = html.substring(srcStart + 5, srcEnd);
    console.log("Original src of background 2:", originalSrc);
    
    // Replace it with /wp-content/uploads/2025/03/Presentes768.png
    const newSrc = '/wp-content/uploads/2025/03/Presentes768.png';
    html = html.substring(0, srcStart + 5) + newSrc + html.substring(srcEnd);
    
    // Also let's update alt text back to "Personal técnico SIM Energy en instalación eléctrica industrial"
    const altStart = html.indexOf('alt="', srcEnd);
    if (altStart !== -1 && altStart < srcEnd + 100) {
      const altEnd = html.indexOf('"', altStart + 5);
      html = html.substring(0, altStart + 5) + "Personal técnico SIM Energy en instalación eléctrica industrial" + html.substring(altEnd);
      console.log("Updated alt text of background 2.");
    }
    
    fs.writeFileSync(indexFile, html, 'utf8');
    console.log("Successfully changed background 2 src back to:", newSrc);
  } else {
    console.log("Could not find src attribute for background 2");
  }
} else {
  console.log("Could not find background 2");
}
