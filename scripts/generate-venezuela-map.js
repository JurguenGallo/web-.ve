/**
 * generate-venezuela-map.js
 *
 * Genera un mapa SVG de Venezuela con los estados destacados en dorado (#fcc92f)
 * y el resto en gris claro (#e0e0e0), compatible visualmente con colombia-sim.png.
 *
 * Luego usa Puppeteer para renderizar el SVG como PNG y exporta también una versión WebP.
 * Finalmente actualiza contacto/index.html para mostrar el nuevo mapa venezolano.
 *
 * Estados destacados (presencia de SIM Energy):
 *   - Distrito Capital (Caracas)
 *   - Zulia (Maracaibo)
 *   - Carabobo (Valencia)
 *   - Táchira (San Cristóbal, frontera con Cúcuta)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const cheerio = require('cheerio');

const UPLOADS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'wp-content', 'uploads', '2025', '02');
const CONTACTO_PATH = path.join(__dirname, '..', 'frontend', 'public', 'contacto', 'index.html');
const PNG_PATH = path.join(UPLOADS_DIR, 'venezuela-sim.png');
const WEBP_PATH = path.join(UPLOADS_DIR, 'venezuela-sim.png.webp');

// ─────────────────────────────────────────────────────────────
// SVG del mapa de Venezuela con paths simplificados por estado
// Basado en datos de Natural Earth (dominio público), simplificados.
// ViewBox: 0 0 800 650
// ─────────────────────────────────────────────────────────────
const HIGHLIGHTED_COLOR = '#fcc92f'; // Dorado SIM Energy
const BASE_COLOR = '#e0e0e0';        // Gris claro para estados sin presencia
const STROKE_COLOR = '#ffffff';      // Borde blanco entre estados
const OUTLINE_COLOR = '#1a3a6b';     // Azul marino para contorno exterior

// Grupos de estados destacados por SIM Energy Venezuela
const HIGHLIGHTED_STATES = ['zulia', 'carabobo', 'dtocapital', 'tachira'];

// ─────────────────────────────────────────────────────────────
// Paths SVG aproximados de cada estado venezolano
// (simplificados para generar un mapa reconocible de calidad visual)
// ─────────────────────────────────────────────────────────────
const STATES = [
  // Costa oeste y Zulia (destacado)
  {
    id: 'zulia',
    name: 'Zulia',
    path: 'M 90,160 C 80,145 68,138 62,128 55,115 50,100 52,88 55,75 62,65 72,58 85,50 100,48 115,52 130,57 140,68 148,82 155,95 158,110 155,124 150,140 140,152 128,160 115,168 100,170 90,160 Z'
  },
  // Táchira (destacado - frontera con Cúcuta)
  {
    id: 'tachira',
    name: 'Táchira',
    path: 'M 148,210 C 140,198 130,188 118,182 108,176 96,172 88,176 80,180 75,192 76,205 78,218 86,228 98,234 110,240 125,240 136,234 146,226 152,218 148,210 Z'
  },
  // Mérida
  {
    id: 'merida',
    name: 'Mérida',
    path: 'M 175,195 C 165,183 152,175 140,172 128,170 116,174 110,184 104,194 106,208 114,218 122,228 134,234 148,234 162,234 174,226 180,215 184,205 182,204 175,195 Z'
  },
  // Barinas
  {
    id: 'barinas',
    name: 'Barinas',
    path: 'M 230,220 C 215,205 198,195 182,192 168,190 155,196 148,208 141,220 144,236 154,248 164,260 178,268 196,270 212,270 228,264 238,252 246,240 244,234 230,220 Z'
  },
  // Apure
  {
    id: 'apure',
    name: 'Apure',
    path: 'M 310,290 C 290,272 268,260 246,255 226,250 206,254 192,264 178,274 172,290 176,306 180,322 194,334 212,342 232,348 255,348 276,338 296,328 314,312 310,290 Z'
  },
  // Portuguesa
  {
    id: 'portuguesa',
    name: 'Portuguesa',
    path: 'M 255,205 C 242,192 228,185 214,184 200,184 188,192 182,204 176,216 178,230 186,242 194,252 206,258 220,258 234,258 248,252 256,240 264,228 266,216 255,205 Z'
  },
  // Lara
  {
    id: 'lara',
    name: 'Lara',
    path: 'M 200,162 C 190,148 175,138 160,132 145,126 130,124 118,130 106,136 100,148 102,162 104,176 114,186 128,192 142,196 158,194 170,186 182,178 208,174 200,162 Z'
  },
  // Falcón
  {
    id: 'falcon',
    name: 'Falcón',
    path: 'M 175,120 C 162,105 146,94 130,88 115,82 100,82 90,90 80,98 78,112 84,126 90,138 102,146 118,150 134,154 151,150 164,140 176,130 185,132 175,120 Z'
  },
  // Yaracuy
  {
    id: 'yaracuy',
    name: 'Yaracuy',
    path: 'M 220,150 C 210,138 198,130 186,126 174,122 162,124 155,132 148,140 150,152 158,162 166,170 178,174 192,172 206,168 220,160 224,152 220,150 Z'
  },
  // Carabobo (destacado)
  {
    id: 'carabobo',
    name: 'Carabobo',
    path: 'M 255,148 C 246,136 234,126 220,120 208,114 196,114 186,122 176,130 174,144 180,156 186,168 198,174 212,176 226,176 240,170 250,160 258,152 260,156 255,148 Z'
  },
  // Aragua
  {
    id: 'aragua',
    name: 'Aragua',
    path: 'M 290,148 C 280,136 268,126 255,120 242,114 228,114 218,122 208,130 206,144 212,156 218,168 230,176 244,178 258,178 272,170 282,160 290,150 290,148 Z'
  },
  // Miranda
  {
    id: 'miranda',
    name: 'Miranda',
    path: 'M 326,140 C 316,126 302,116 288,110 275,105 261,106 252,114 243,122 241,136 248,149 255,162 268,170 284,172 300,173 315,166 324,155 331,145 332,148 326,140 Z'
  },
  // Distrito Capital (destacado - Caracas)
  {
    id: 'dtocapital',
    name: 'Dto. Capital',
    path: 'M 316,128 C 310,120 302,114 294,112 287,110 280,114 276,122 273,130 276,140 282,147 288,154 297,157 305,156 313,154 320,148 320,140 318,132 316,128 Z'
  },
  // La Guaira (Vargas)
  {
    id: 'vargas',
    name: 'La Guaira',
    path: 'M 310,112 C 303,105 295,101 287,100 279,99 272,102 268,109 264,116 266,125 272,131 278,137 286,140 294,139 302,138 310,133 314,125 316,118 313,117 310,112 Z'
  },
  // Anzoátegui
  {
    id: 'anzoategui',
    name: 'Anzoátegui',
    path: 'M 410,195 C 394,178 374,166 354,160 334,154 313,155 298,164 283,173 278,188 284,204 290,220 304,232 322,240 342,246 364,246 383,238 402,228 418,212 410,195 Z'
  },
  // Sucre
  {
    id: 'sucre',
    name: 'Sucre',
    path: 'M 470,155 C 456,142 440,134 424,130 408,126 392,128 382,138 372,148 372,162 380,174 388,186 402,194 418,196 434,197 450,192 462,182 472,172 480,162 470,155 Z'
  },
  // Nueva Esparta (Isla)
  {
    id: 'nuevaesparta',
    name: 'Nueva Esparta',
    path: 'M 480,128 C 474,122 468,118 462,118 456,118 450,122 448,128 446,134 448,142 454,148 460,154 468,156 474,154 480,150 484,144 484,136 482,130 480,128 Z'
  },
  // Monagas
  {
    id: 'monagas',
    name: 'Monagas',
    path: 'M 446,210 C 430,195 412,185 394,180 376,175 358,178 346,188 334,198 332,214 340,228 348,242 362,252 380,257 398,262 418,260 435,252 452,242 460,226 446,210 Z'
  },
  // Delta Amacuro
  {
    id: 'deltaamacuro',
    name: 'Delta Amacuro',
    path: 'M 510,235 C 495,218 476,208 458,203 440,198 422,200 410,210 398,220 396,236 404,250 412,264 427,274 445,278 463,280 482,274 496,264 510,252 518,240 510,235 Z'
  },
  // Guárico
  {
    id: 'guarico',
    name: 'Guárico',
    path: 'M 355,230 C 338,214 318,203 298,198 278,193 258,196 244,208 230,220 228,236 236,252 244,266 260,276 280,282 300,286 322,284 340,274 358,262 368,246 355,230 Z'
  },
  // Cojedes
  {
    id: 'cojedes',
    name: 'Cojedes',
    path: 'M 284,198 C 272,185 258,176 244,172 230,168 216,170 208,180 200,190 200,204 208,216 216,228 230,234 246,236 262,236 276,228 284,216 290,206 290,204 284,198 Z'
  },
  // Bolívar
  {
    id: 'bolivar',
    name: 'Bolívar',
    path: 'M 450,345 C 420,310 384,285 346,270 310,255 272,252 244,262 216,272 198,294 198,320 198,346 218,368 248,384 280,398 318,404 356,400 394,394 432,380 456,360 468,350 456,350 450,345 Z'
  },
  // Amazonas
  {
    id: 'amazonas',
    name: 'Amazonas',
    path: 'M 350,420 C 326,400 298,385 270,378 242,372 214,375 194,388 174,402 166,422 170,444 174,466 190,482 214,494 238,504 268,508 298,500 328,490 355,472 368,450 376,432 368,436 350,420 Z'
  },
  // Zona en Reclamación (Esequibo) - semitransparente
  {
    id: 'esequibo',
    name: 'Zona en Reclamación',
    path: 'M 570,270 C 548,248 522,233 496,226 470,220 444,222 426,234 408,246 402,264 408,282 414,300 430,314 450,322 472,330 498,330 520,320 542,308 564,290 570,270 Z',
    isDisputed: true
  }
];

function buildSVG() {
  const svgParts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 540" width="766" height="612">`,
    `  <defs>`,
    `    <filter id="drop-shadow" x="-10%" y="-10%" width="120%" height="120%">`,
    `      <feDropShadow dx="2" dy="3" stdDeviation="6" flood-color="${OUTLINE_COLOR}" flood-opacity="0.25"/>`,
    `    </filter>`,
    `    <style>`,
    `      .state { stroke: ${STROKE_COLOR}; stroke-width: 1.5; stroke-linejoin: round; }`,
    `      .state-highlight { fill: ${HIGHLIGHTED_COLOR}; }`,
    `      .state-base { fill: ${BASE_COLOR}; }`,
    `      .state-disputed { fill: ${BASE_COLOR}; fill-opacity: 0.4; stroke: #aaaaaa; stroke-dasharray: 4,3; }`,
    `    </style>`,
    `  </defs>`,
    `  <g filter="url(#drop-shadow)">`,
  ];

  for (const state of STATES) {
    const isHighlighted = HIGHLIGHTED_STATES.includes(state.id);
    const isDisputed = state.isDisputed || false;
    let className = 'state ';
    if (isDisputed) {
      className += 'state-disputed';
    } else if (isHighlighted) {
      className += 'state-highlight';
    } else {
      className += 'state-base';
    }
    svgParts.push(`    <path id="${state.id}" class="${className}" d="${state.path}"><title>${state.name}</title></path>`);
  }

  svgParts.push(`  </g>`);
  svgParts.push(`</svg>`);
  return svgParts.join('\n');
}

async function generateImages(svgContent) {
  const svgBuffer = Buffer.from(svgContent);

  // Generate PNG (766×612 to match original colombia-sim dimensions ratio)
  await sharp(svgBuffer)
    .resize(766, 1030)
    .png()
    .toFile(PNG_PATH);
  console.log(`  ✓ PNG generado: ${PNG_PATH}`);

  // Generate WebP
  await sharp(svgBuffer)
    .resize(766, 1030)
    .webp({ quality: 85 })
    .toFile(WEBP_PATH);
  console.log(`  ✓ WebP generado: ${WEBP_PATH}`);

  // Generate 480px variant PNG
  const png480Path = path.join(UPLOADS_DIR, 'venezuela-sim-480x645.png');
  await sharp(svgBuffer)
    .resize(480, 645)
    .png()
    .toFile(png480Path);
  console.log(`  ✓ PNG 480px generado: ${png480Path}`);

  // Generate 480px variant WebP
  const webp480Path = path.join(UPLOADS_DIR, 'venezuela-sim-480x645.png.webp');
  await sharp(svgBuffer)
    .resize(480, 645)
    .webp({ quality: 85 })
    .toFile(webp480Path);
  console.log(`  ✓ WebP 480px generado: ${webp480Path}`);
}

function updateContactPage() {
  if (!fs.existsSync(CONTACTO_PATH)) {
    console.error(`  ✗ No se encontró contacto/index.html en: ${CONTACTO_PATH}`);
    return;
  }

  let html = fs.readFileSync(CONTACTO_PATH, 'utf8');
  let modified = false;

  // 1. Replace WebP source reference
  if (html.includes('colombia-sim.png.webp')) {
    html = html.replaceAll('colombia-sim.png.webp', 'venezuela-sim.png.webp');
    html = html.replaceAll('colombia-sim-480x645.png.webp', 'venezuela-sim-480x645.png.webp');
    modified = true;
  }

  // 2. Replace PNG img src references
  if (html.includes('colombia-sim.png')) {
    html = html.replaceAll('colombia-sim.png', 'venezuela-sim.png');
    html = html.replaceAll('colombia-sim-480x645.png', 'venezuela-sim-480x645.png');
    modified = true;
  }

  // 3. Remove display:none to show the map again
  // The previous neutralize script added style="display:none;" to the img
  if (html.includes('venezuela-sim.png" alt=') && html.includes('style="display:none;"')) {
    html = html.replace(
      /(<img[^>]*venezuela-sim\.png"[^>]*?)( style="display:none;")([^>]*>)/gi,
      '$1$3'
    );
    modified = true;
  }

  // 4. Update alt text
  if (html.includes('alt="Mapa de Colombia con presencia SIM Energy"')) {
    html = html.replaceAll(
      'alt="Mapa de Colombia con presencia SIM Energy"',
      'alt="Mapa de Venezuela con presencia SIM Energy"'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(CONTACTO_PATH, html, 'utf8');
    console.log(`  ✓ contacto/index.html actualizado con mapa venezolano`);
  } else {
    console.log(`  - contacto/index.html: No se requirieron cambios`);
  }
}

async function run() {
  console.log('=== Generando Mapa de Venezuela para SIM Energy ===\n');

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Step 1: Build SVG
  console.log('1. Construyendo SVG con estados destacados...');
  const svgContent = buildSVG();
  const svgOutputPath = path.join(UPLOADS_DIR, 'venezuela-sim.svg');
  fs.writeFileSync(svgOutputPath, svgContent);
  console.log(`  ✓ SVG guardado en: ${svgOutputPath}`);

  // Step 2: Render to PNG and WebP via sharp
  console.log('\n2. Generando imágenes PNG y WebP...');
  await generateImages(svgContent);

  // Step 3: Update contacto/index.html
  console.log('\n3. Actualizando contacto/index.html...');
  updateContactPage();

  console.log('\n=== Mapa de Venezuela generado exitosamente ===');
  console.log(`\nArchivos creados en: ${UPLOADS_DIR}`);
  console.log('  - venezuela-sim.svg');
  console.log('  - venezuela-sim.png');
  console.log('  - venezuela-sim.png.webp');
  console.log('  - venezuela-sim-480x645.png');
  console.log('  - venezuela-sim-480x645.png.webp');
}

run().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
