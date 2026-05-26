const fs = require('fs');
const file = 'c:/Users/Dell/Desktop/sim-energy-ve/web-.ve/frontend/public/contacto/index.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<h1 style="text-align: center; word-break: normal; font-size: clamp(2.5rem, 4.5vw, 4rem); letter-spacing: -1px; line-height: 1.2; margin-bottom: 20px;">¡CON PRESENCIA <br><span style="color:#fcc92f">INTERNACIONAL</span>!</h1>',
  '<h1 style="text-align: center; font-size: clamp(1.5rem, 3.5vw, 3rem); letter-spacing: -1px; line-height: 1.2; margin-bottom: 20px;">¡CON PRESENCIA <br><span style="color:#fcc92f; white-space: nowrap;">INTERNACIONAL!</span></h1>'
);

fs.writeFileSync(file, content);
