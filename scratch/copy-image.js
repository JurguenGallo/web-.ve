const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', '..', 'Portada de pagina web.png');
const destDir = path.join(__dirname, '..', 'frontend', 'public', 'wp-content', 'uploads', '2026', 'portada-venezuela');
const destFile = path.join(destDir, 'Portada de pagina web.png');

console.log("Source file:", srcFile);
console.log("Source exists:", fs.existsSync(srcFile));
console.log("Destination directory:", destDir);

try {
  // Create directory recursively
  fs.mkdirSync(destDir, { recursive: true });
  console.log("Created destination directory.");
  
  // Copy file
  fs.copyFileSync(srcFile, destFile);
  console.log("Successfully copied file to:", destFile);
  console.log("Destination file size:", fs.statSync(destFile).size, "bytes");
} catch(e) {
  console.error("Error during copy:", e);
}
