const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// 1. Restore Slide 2's background to Presentes768.png
// I replaced it globally, so I need to find the SECOND occurrence of portada-venezuela.png inside a <picture> and change it back.
// Actually, I can just search for "Personal técnico SIM Energy en instalación eléctrica industrial" which is the alt text for slide 2.
const slide2Alt = 'Personal técnico SIM Energy en instalación eléctrica industrial';
const slide2Idx = html.indexOf(slide2Alt);
if (slide2Idx !== -1) {
  const start = Math.max(0, slide2Idx - 300);
  const end = html.indexOf('>', slide2Idx);
  const snippet = html.substring(start, end);
  if (snippet.includes('portada-venezuela.png')) {
    const newSnippet = snippet.replace('portada-venezuela.png', 'Presentes768.png');
    html = html.replace(snippet, newSnippet);
    console.log('Restored Slide 2 background to Presentes768.png');
  }
}

// 2. Fix button alignment
const btn1Text = 'CONOCE MÁS';
const btn2Text = 'COTIZA AQUÍ';

function getButtonTop(text) {
  const idx = html.indexOf(text);
  if (idx !== -1) {
    const start = Math.max(0, html.lastIndexOf('<div class="n2-ss-layer', idx));
    const end = html.indexOf('>', start);
    const snippet = html.substring(start, end);
    const topMatch = snippet.match(/data-desktopportraittop="([^"]+)"/);
    if (topMatch) {
      return { snippet, top: topMatch[1] };
    }
  }
  return null;
}

const btn1 = getButtonTop(btn1Text);
const btn2 = getButtonTop(btn2Text);

if (btn1 && btn2) {
  console.log(`Button 1 top: ${btn1.top}`);
  console.log(`Button 2 top: ${btn2.top}`);
  
  // Align Button 2 to Button 1
  const newSnippet2 = btn2.snippet.replace(`data-desktopportraittop="${btn2.top}"`, `data-desktopportraittop="${btn1.top}"`);
  html = html.replace(btn2.snippet, newSnippet2);
  console.log(`Aligned Button 2 to top: ${btn1.top}`);
} else {
  console.log('Could not find buttons');
}

fs.writeFileSync(indexFile, html, 'utf8');
