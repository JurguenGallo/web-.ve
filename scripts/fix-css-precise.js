const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const styleTag = `<style>
  /* Fix Title Overlap */
  h2.n2-font-363b3bd120ea6250c3777de40a38a8f0-hover {
    font-size: 85% !important;
    line-height: 1.1 !important;
  }
  
  /* Separate Autoplay Pie from Next Arrow on main slider */
  div#n2-ss-17 .nextend-indicator-pie {
    margin-top: 60px !important; /* Push the pie indicator down so it doesn't overlap the arrow */
  }
</style></head>`;

if (!html.includes('/* Fix Title Overlap */')) {
  html = html.replace('</head>', styleTag);
  fs.writeFileSync(indexFile, html, 'utf8');
  console.log('Injected custom CSS to fix visual bugs.');
} else {
  console.log('CSS already injected.');
}
