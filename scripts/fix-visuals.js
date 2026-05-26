const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

let changed = false;

// Fix 1: Move the paragraph down
const pContext = 'Cada proyecto es una nueva oportunidad';
if (html.includes(pContext)) {
  const snippetStart = Math.max(0, html.indexOf(pContext) - 800);
  const snippet = html.substring(snippetStart, html.indexOf(pContext));
  
  if (snippet.includes('data-desktopportraittop="22"')) {
    const newSnippet = snippet.replace('data-desktopportraittop="22"', 'data-desktopportraittop="120"'); // Increased down to 120
    html = html.replace(snippet, newSnippet);
    changed = true;
    console.log('Fixed text overlap by moving paragraph down to 120px.');
  } else {
    console.log('Could not find data-desktopportraittop="22" in the snippet.');
  }
}

// Fix 2: Duplicated loading circle/arrow.
// Let's search for SVG elements or nextend arrows.
console.log('\n--- Arrow/Widget HTML elements ---');
const widgetRegex = /<div class="[^"]*nextend-arrow[^>]*>.*?<\/div>/g;
let match;
while ((match = widgetRegex.exec(html)) !== null) {
  console.log(match[0]);
}

// Check for duplicated SVGs or widgets at the very end of the slider div
const sliderEnd = html.lastIndexOf('</div><div class="n2-ss-widget');
if (sliderEnd !== -1) {
  console.log('\n--- Slider Widgets at end ---');
  console.log(html.substring(sliderEnd, sliderEnd + 500));
}

if (changed) {
  fs.writeFileSync(indexFile, html, 'utf8');
}
