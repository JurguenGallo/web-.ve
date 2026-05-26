const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Find the SmartSliderSimple init for n2-ss-17 and get the full script
const target = '"n2-ss-17"';
const idx = html.indexOf(target);
if (idx !== -1) {
  // Go back to find the script tag
  const scriptStart = html.lastIndexOf('<script', idx);
  const scriptEnd = html.indexOf('</script>', idx) + 9;
  const scriptContent = html.substring(scriptStart, scriptEnd);
  console.log("n2-ss-17 init script:");
  console.log(scriptContent.substring(0, 3000));
} else {
  console.log("n2-ss-17 init script not found");
}
