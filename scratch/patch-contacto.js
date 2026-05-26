const fs = require('fs');
const file = 'c:/Users/Dell/Desktop/sim-energy-ve/web-.ve/frontend/public/contacto/index.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<h1>¡CON PRESENCIA <span style="color:#fcc92f">INTERNACIONAL</span>!</h1>',
  '<h1 style="word-break: normal; font-size: clamp(2rem, 3.5vw, 3rem); letter-spacing: -1px;">¡CON PRESENCIA <span style="color:#fcc92f">INTERNACIONAL</span>!</h1>'
);

content = content.replace('data-number-value="17"', 'data-number-value="18"');
content = content.replace('data-number-value="+100"', 'data-number-value="+120"');

fs.writeFileSync(file, content);
