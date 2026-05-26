const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'frontend', 'public', 'wp-content', 'uploads', '2025', '03');
const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');

// The structure of bg2 is currently:
// <picture class="skip-lazy" data-skip-lazy="1" style="filter:blur(0px)">
//   <img decoding="async" src="/wp-content/uploads/2025/03/portada-venezuela.png" ...>
// </picture>
//
// This is the 800px-wide slide (Slide 2 for tablet view).
// The portada-venezuela.png is 1920px wide, which works fine even for 800px display.
// The original Presentes768.png was the Colombia map - we replaced it correctly.
//
// THE REAL ISSUE: When SmartSlider renders, it loads background 1 immediately (slide-active).
// Background 2 is hidden (transform:translate3d(-100000px,0,0)). When user clicks next/prev,
// the slider JS swaps them. If the image fails to load, it shows broken.
//
// Let me check if the Venezuela image is accessible at the expected path.
// The file should be at /wp-content/uploads/2025/03/portada-venezuela.png

const venezuelaPath = path.join(uploadsDir, 'portada-venezuela.png');
console.log("Venezuela PNG path:", venezuelaPath);
console.log("Exists:", fs.existsSync(venezuelaPath));
console.log("Size:", fs.existsSync(venezuelaPath) ? fs.statSync(venezuelaPath).size + " bytes" : "N/A");

// Let's look at the current full background 2 HTML structure to understand the issue
let html = fs.readFileSync(indexFile, 'utf8');
const bg2Start = html.indexOf('data-public-id="2" data-mode="fill"');
const bg2End = html.indexOf('</div></div></div>', bg2Start) + '</div></div></div>'.length;
console.log("\nCurrent bg2:");
console.log(html.substring(bg2Start, bg2End));

// DIAGNOSIS: The picture tag in bg2 uses data-skip-lazy="1" without any webp sources.
// The slider JS might be checking for a specific size attribute or data attribute.
// Let me look if there's a CSS issue - maybe the second slide's image is hidden by CSS

// Check if there's a specific CSS rule for n2-ss-17 background 2
const cssMatch = html.match(/#n2-ss-17[^{]*\{[^}]*\}/g);
if (cssMatch) {
  console.log("\nCSS rules for #n2-ss-17:");
  cssMatch.forEach(r => console.log(r));
}
