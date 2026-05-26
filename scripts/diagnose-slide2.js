const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// The background 2 has data-y="93" which is very high (93% from top).
// For the Venezuela image (which is a landscape banner), this crops it very low.
// Background 1 also has data-y="93" but maybe that's the correct position for the Venezuela image.
// The issue is different though.

// Let's check: slide 2 (data-id=73) has width:800px;height:460.5px in its style
// This is the slide for 800px wide screens.
// The background has --ss-o-pos-y:93% which might be causing it to crop wrong.

// Actually - the problem might be that Slide 2 (data-id=73) has data-slide-public-id="2"
// which maps to Background 2 (public-id=2). That background has the portada-venezuela.png.
// But the SLIDER ENGINE uses JavaScript to move backgrounds. If the JS is not re-initializing
// correctly because the file sizes differ, it may not display.

// More likely issue: The portada-venezuela.png was added at a SIZE that doesn't match
// the original Presentes768.png. The Smart Slider JS calculates dimensions from the original.

// The REAL fix: Keep portada-venezuela.png for bg1 and for bg2, 
// but also update the preload links in the <head> to point to portada-venezuela.png

// Check what preload links exist for the old images
const hasOldPreload768 = html.includes('Presentes768') && html.includes('preload');
const hasOldPreload5 = html.includes('Presentes5') && html.includes('preload');
console.log("Has preload for Presentes768:", hasOldPreload768);
console.log("Has preload for Presentes5:", hasOldPreload5);

// Check if there are any references to Presentes768 still in head
const presentes768Refs = [];
let idx = 0;
while ((idx = html.indexOf('Presentes768', idx)) !== -1) {
  presentes768Refs.push({ idx, context: html.substring(idx - 100, idx + 100) });
  idx++;
}
console.log(`\nPresentes768 references: ${presentes768Refs.length}`);
presentes768Refs.forEach(ref => {
  console.log(`  Context: ...${ref.context}...`);
});

// Also check for any CSS style in <style> that might be restricting the second slide
const styleTag = html.match(/<style data-related="n2-ss-17">[\s\S]*?<\/style>/);
if (styleTag) {
  // Check for n2-ss-slide-73 specific styles
  const slide73style = styleTag[0].match(/n2-ss-slide-73[^{]*\{[^}]*\}/g);
  console.log("\nSlide 73 specific CSS:", slide73style || "none");
}
