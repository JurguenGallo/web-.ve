const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const $ = cheerio.load(html);

const section = $('.et_pb_section_3');
if (section.length === 0) {
  console.log("Error: .et_pb_section_3 not found!");
  process.exit(1);
}

console.log("Replacing logo slider with CSS marquee...");

const marqueeHtml = `
<div class="logo-marquee-section">
  <div class="logo-marquee-container">
    <div class="logo-marquee-wrapper">
      <!-- Set 1 -->
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Siemens-S.A.-10.png" alt="Siemens S.A."></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Siemens-Energy-10.png" alt="Siemens Energy"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Areonautica-Civil-1.png" alt="Aeronáutica Civil"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Hospital-Villa-del-Rosario-1.png" alt="Hospital Villa del Rosario"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/smart-wire.png" alt="Smart Wire"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Gestion-y-Disenos-Electricos-SAS-2.png" alt="Gestión y Diseños Eléctricos"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Termotasajero.png" alt="Termotasajero"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/HMV1.png" alt="HMV"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/axon.png" alt="Axon Group"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/58.png" alt="Elecnor"></div>
      <!-- Set 2 (Duplicate for seamless loop) -->
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Siemens-S.A.-10.png" alt="Siemens S.A."></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Siemens-Energy-10.png" alt="Siemens Energy"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Areonautica-Civil-1.png" alt="Aeronáutica Civil"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Hospital-Villa-del-Rosario-1.png" alt="Hospital Villa del Rosario"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/smart-wire.png" alt="Smart Wire"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Gestion-y-Disenos-Electricos-SAS-2.png" alt="Gestión y Diseños Eléctricos"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/Termotasajero.png" alt="Termotasajero"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/HMV1.png" alt="HMV"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/axon.png" alt="Axon Group"></div>
      <div class="logo-marquee-item"><img src="/wp-content/uploads/2024/03/58.png" alt="Elecnor"></div>
    </div>
  </div>
</div>

<style>
.logo-marquee-section {
  padding: 40px 0;
  background: #ffffff;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.logo-marquee-container {
  overflow: hidden;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.logo-marquee-container::before,
.logo-marquee-container::after {
  content: "";
  position: absolute;
  top: 0;
  width: 120px;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.logo-marquee-container::before {
  left: 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
}

.logo-marquee-container::after {
  right: 0;
  background: linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
}

.logo-marquee-wrapper {
  display: flex;
  width: max-content;
  animation: logo-scroll 45s linear infinite;
}

.logo-marquee-wrapper:hover {
  animation-play-state: paused;
}

.logo-marquee-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 240px;
  height: 100px;
  padding: 0 25px;
  box-sizing: border-box;
}

.logo-marquee-item img {
  max-width: 100%;
  max-height: 55px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.65;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-marquee-item img:hover {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.08);
}

@keyframes logo-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-2400px);
  }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .logo-marquee-section {
    padding: 25px 0;
  }
  .logo-marquee-container::before,
  .logo-marquee-container::after {
    width: 60px;
  }
  .logo-marquee-item {
    width: 180px;
    height: 80px;
    padding: 0 15px;
  }
  .logo-marquee-item img {
    max-height: 40px;
  }
  @keyframes logo-scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-1800px);
    }
  }
}
</style>
`;

section.empty().append(marqueeHtml);

// Serialize back
const updatedHtml = $.html();
fs.writeFileSync(indexFile, updatedHtml, 'utf8');
console.log("Successfully replaced logo slider with infinite marquee in index.html!");
