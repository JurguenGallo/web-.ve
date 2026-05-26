const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Find all sources in the <picture> tags of n2-ss-17 slides
// (srcset, etc.)
const pictureSrcRegex = /<picture[^>]*>.*?<\/picture>/gs;
const pics = html.match(pictureSrcRegex) || [];

// Check for slider cache files related to portada-venezuela or Presentes
pics.forEach((pic, i) => {
  if (pic.includes('portada-venezuela') || pic.includes('Presentes') || pic.includes('slider/cache')) {
    const shortPic = pic.substring(0, 500);
    if (shortPic.includes('slider/cache') || shortPic.includes('portada-venezuela') || shortPic.includes('Presentes')) {
      console.log(`Picture ${i + 1}:`);
      console.log(shortPic);
      console.log();
    }
  }
});

// Also check if there are webp cached versions of the Venezuela image 
const webpCacheDir = path.join(__dirname, '..', 'frontend', 'public', 'wp-content', 'uploads', 'slider', 'cache');
if (fs.existsSync(webpCacheDir)) {
  console.log("\nSlider cache directory exists.");
  // List all files 
  const dirs = fs.readdirSync(webpCacheDir);
  console.log(`Total cache subdirs: ${dirs.length}`);
} else {
  console.log("\nSlider cache directory does NOT exist.");
}
