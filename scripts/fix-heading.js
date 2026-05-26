const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// The heading was changed from "Últimos proyectos" to "Nuestros Últimos Proyectos de Ingeniería Eléctrica"
// by the SEO script. Let's also check the data-desktopportraittop value (was 22, changed to 120)

const OLD_HEADING = 'Nuestros Últimos Proyectos de Ingeniería Eléctrica';
const NEW_HEADING = 'Últimos proyectos';

let count = 0;
if (html.includes(OLD_HEADING)) {
  html = html.split(OLD_HEADING).join(NEW_HEADING);
  count++;
  console.log(`Replaced heading: "${OLD_HEADING}" -> "${NEW_HEADING}"`);
} else {
  console.log(`Heading "${OLD_HEADING}" not found!`);
}

// Also check if the paragraph top position was changed (120 vs original 22)
// The original was data-desktopportraittop="22" for the paragraph below the heading
// Let's check if it was changed to 120 by the fix-visuals.js or similar scripts
const OLD_TOP = 'data-desktopportraittop="120"';
const NEW_TOP = 'data-desktopportraittop="22"';
if (html.includes(OLD_TOP)) {
  html = html.split(OLD_TOP).join(NEW_TOP);
  console.log(`Reverted paragraph top from 120 to 22`);
} else {
  console.log(`data-desktopportraittop="120" not found (already at 22?)`);
}

if (count > 0) {
  fs.writeFileSync(indexFile, html, 'utf8');
  console.log('Successfully updated index.html!');
}
