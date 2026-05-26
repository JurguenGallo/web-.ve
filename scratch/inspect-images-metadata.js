const sharp = require('sharp');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'frontend', 'public', 'wp-content', 'uploads', '2025', '03');

async function check() {
  const p5 = path.join(uploadsDir, 'Presentes5.png');
  const p768 = path.join(uploadsDir, 'Presentes768.png');
  const port = path.join(uploadsDir, 'portada-venezuela.png');

  try {
    const m5 = await sharp(p5).metadata();
    console.log("Presentes5.png metadata:", m5.width, "x", m5.height);
  } catch(e) { console.error("Error reading Presentes5.png:", e.message); }

  try {
    const m768 = await sharp(p768).metadata();
    console.log("Presentes768.png metadata:", m768.width, "x", m768.height);
  } catch(e) { console.error("Error reading Presentes768.png:", e.message); }

  try {
    const mPort = await sharp(port).metadata();
    console.log("portada-venezuela.png metadata:", mPort.width, "x", mPort.height);
  } catch(e) { console.error("Error reading portada-venezuela.png:", e.message); }
}

check();
