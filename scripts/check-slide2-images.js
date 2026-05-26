const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'frontend', 'public', 'wp-content', 'uploads', '2025', '03');

// Source: portada-venezuela.png
// We need to create portada-venezuela-768.png as well so both slides have valid images
const sourceFile = path.join(uploadsDir, 'portada-venezuela.png');
const destFile768 = path.join(uploadsDir, 'portada-venezuela-768.png');

// Check source exists
if (!fs.existsSync(sourceFile)) {
  console.error("Source file not found:", sourceFile);
  process.exit(1);
}

// Check what Presentes768.png was - it should still exist since we didn't delete it
const presentes768 = path.join(uploadsDir, 'Presentes768.png');
console.log("Presentes768.png exists:", fs.existsSync(presentes768));
console.log("portada-venezuela.png exists:", fs.existsSync(sourceFile));

// The fix: Replace Presentes768.png with portada-venezuela.png 
// by copying portada-venezuela.png as Presentes768.png
// OR: update index.html background 2 to use portada-venezuela.png (already done)
// The real issue might be that the SECOND SLIDE background (public-id=2) 
// was using Presentes768.png which was the MOBILE/SMALL version 
// and the file doesn't exist anymore OR the image doesn't render

// Let's check if Presentes768.png still exists:
if (fs.existsSync(presentes768)) {
  const stats = fs.statSync(presentes768);
  console.log("Presentes768.png size:", stats.size, "bytes");
}

// Sizes
const venezuelaStats = fs.statSync(sourceFile);
console.log("portada-venezuela.png size:", venezuelaStats.size, "bytes");
