# Bitácora del Proyecto — SIM Energy .ve

## Objetivo
Migrar y convertir el sitio **simenergy.com.co** (WordPress + PHP + Divi) a un sitio **estático en HTML/CSS/JS** para **simenergy.com.ve**, alojado en un VPS Truobox.

---

## Estructura del Proyecto

```
web-.ve/
├── frontend/
│   └── public/              # Sitio estático (HTML, CSS, JS, imágenes, fuentes)
├── scripts/                  # Utilidades de automatización
│   ├── crawler.js            # Descarga el .co como sitio estático con Puppeteer
│   ├── fix-seo.js            # Aplica correcciones SEO a los HTML
│   ├── verify-fixes.js       # Verifica que las correcciones se aplicaron
│   ├── neutralize-content.js # Neutraliza referencias a Colombia
│   ├── enhance-seo-keywords.js # Inyecta H1/H2/H3 con keywords de Venezuela
│   ├── generate-sitemap.js   # Genera sitemap.xml y robots.txt
│   ├── optimize-html.js      # Minifica archivos HTML
│   ├── optimize-images.js    # Comprime imágenes en-lugar (sharp)
│   ├── generate-venezuela-map.js # Genera mapa de Venezuela en PNG/WebP
│   ├── patch-contacto-map.js # Actualiza contacto/index.html con mapa .ve
│   └── [otros scripts legacy]
├── docs/                     # Documentación
│   ├── BITACORA.md           # Este archivo — historia del proyecto
│   ├── PLAN_MIGRACION_SIMENERGY.md
│   ├── plan.md
│   ├── tasks.md
│   ├── README.md
│   └── Auditoria SEO pagina web SIM.pdf
├── .gitignore
├── package.json
└── package-lock.json
```

---

## Metodología

### 1. Crawling (Descarga del sitio)
- **Herramienta:** Puppeteer (headless Chrome) + Node.js
- **Script:** `scripts/crawler.js`
- **Proceso:**
  1. Navega cada página del .co con un navegador headless
  2. Espera a que cargue todo el JS (Divi, Smart Slider, WP Rocket)
  3. Guarda el HTML renderizado como archivo `.html`
  4. Intercepta y descarga todos los assets (CSS, JS, imágenes, fuentes)
  5. Sigue enlaces internos recursivamente (hasta 30 páginas)
- **Resultado:** 9 páginas HTML + ~120 assets (8.5MB)

### 2. SEO Fixes
- **Herramienta:** `scripts/fix-seo.js` (Node.js)
- **Base:** Auditoría SEO (docs/Auditoria SEO pagina web SIM.pdf)
- **Correcciones aplicadas en todos los HTML:**

| # | Problema | Solución |
|---|----------|----------|
| 1 | **27/30 imágenes sin alt text** | Se agregó `alt=""` descriptivo a cada imagen según su contenido |
| 2 | **3 H1 duplicados "Últimos proyectos"** | Se dejó 1 solo H1 con el nombre de la empresa; los otros pasaron a H2 |
| 3 | **Viewport con user-scalable=0** | Se limpió el meta viewport para permitir zoom |
| 4 | **Title sin ubicación** | Se cambió a `"SIM Energy | Ingeniería Eléctrica en Venezuela"` |
| 5 | **Meta description genérica** | Se actualizó incluyendo "Venezuela" y todos los servicios |
| 6 | **og:title = "Inicio"** | Se cambió al título real de la empresa |
| 7 | **og:image inexistente** | Se agregó apuntando al logo (`/wp-content/uploads/2025/02/logo-sim2025.png`) |
| 8 | **Schema JSON-LD incompleto** | Se agregó schema `Organization + ProfessionalService` con servicios listados |
| 9 | **Twitter cards sin imagen** | Se agregó `twitter:image` con el logo |

### 3. Reestructuración del proyecto
- Se movió el sitio estático a `frontend/public/`
- Se movieron los scripts a `scripts/`
- Se movió la documentación a `docs/`

---

## Sesión 2 — 2026-05-25

### 4. Neutralización y adaptación de contenido
- **Script:** `scripts/neutralize-content.js`
- Reemplazó el titular "PRESENTES EN VARIAS CIUDADES DE COLOMBIA" por "CON PRESENCIA INTERNACIONAL"
- Ocultó temporalmente el mapa de Colombia (`display:none`) en `contacto/index.html`
- Actualizó la dirección del footer a "Operaciones en Venezuela - Sede origen en Colombia"

### 5. Mejora de keywords SEO (H1/H2/H3)
- **Script:** `scripts/enhance-seo-keywords.js` (usa Cheerio)
- Inyectó H1 oculto con keywords venezolanas en `index.html`
- Mejoró etiquetas H2 de proyectos y servicios
- Añadió bloque H3 de SEO editorial antes del footer

### 6. Generación de sitemap y robots
- **Script:** `scripts/generate-sitemap.js`
- Creó `frontend/public/sitemap.xml` con las 8 páginas del sitio
- Creó `frontend/public/robots.txt` apuntando al sitemap

### 7. Minificación de HTML
- **Script:** `scripts/optimize-html.js` (usa html-minifier-terser)
- Minificó todos los archivos `.html` del sitio (whitespace, comments, JS, CSS inline)

### 8. Optimización de imágenes
- **Script:** `scripts/optimize-images.js` (usa sharp)
- Procesó 186 imágenes (PNG, JPG, WebP) en `wp-content/uploads/`
- **Resultado:** 88 imágenes optimizadas / 98 ya estaban óptimas
- **Espacio ahorrado: 5.45 MB** (el sitio pasó de ~8.5MB a ~3MB en assets)

### 9. Mapa de Venezuela
- **Script:** `scripts/generate-venezuela-map.js` + `scripts/patch-contacto-map.js`
- Generó mapa de Venezuela con estados destacados en dorado (#fcc92f): **Zulia, Carabobo, Distrito Capital y Táchira**
- Estados sin presencia: gris claro (#e0e0e0)
- Archivos generados en `frontend/public/wp-content/uploads/2025/02/`:
  - `venezuela-sim.png` (766×1030)
  - `venezuela-sim.png.webp`
  - `venezuela-sim-480x645.png`
  - `venezuela-sim-480x645.png.webp`
- Actualizó `contacto/index.html`: reemplazó referencias a `colombia-sim.png` y quitó `display:none`

---

## Cómo actualizar el sitio (para el amigo)

### Si el .co cambió y querés bajar los cambios nuevos:
```bash
cd web-.ve
git pull
node scripts/crawler.js
node scripts/fix-seo.js
```

### Si querés corregir algo manualmente:
Los HTML están en `frontend/public/`. Son archivos planos HTML + CSS + JS.

### Para ver el sitio localmente:
```bash
npx http-server frontend/public -p 8080 -c-1 --cors
# Abrir http://localhost:8080
```

### Para subir cambios a GitHub:
```bash
git add -A
git commit -m "Descripción del cambio"
git push
```

---

## Pendientes / Próximos pasos

- [ ] Contratar VPS Truobox
- [ ] Configurar dominio .ve
- [ ] Subir `frontend/public/` al VPS
- [ ] Configurar SSL (Let's Encrypt)
- [x] Crear sitemap.xml funcional ✓
- [x] Agregar más H2/H3 con keywords de servicios en la homepage ✓
- [x] Optimizar HTML (minificar, comprimir) ✓
- [x] Optimizar imágenes (compresión con sharp, -5.45 MB) ✓
- [x] Reemplazar mapa de Colombia por mapa de Venezuela ✓
- [ ] Reemplazar formularios de contacto (WPForms → Formspree o similar)
- [ ] Actualizar números telefónicos venezolanos (+58) cuando el cliente los confirme
- [ ] Agregar blog/páginas de contenido editorial

---

## Notas importantes

- **Divi** es tema premium — se necesita licencia para activarlo en el .ve
- **Nextend Smart Slider Pro** y **Yoast SEO Premium** requieren licencias separadas
- Los formularios (WPForms, Gravity Forms) no funcionan en estático — toca reemplazarlos por formularios HTML/JS simples o un servicio externo (Netlify Forms, Formspree)
- El sitio actualmente pesa ~3MB tras la optimización de imágenes (antes 8.5MB)
- El mapa de Venezuela se generó programáticamente con la librería `sharp`; si se necesita actualizar los estados destacados, editar `HIGHLIGHTED_STATES` en `scripts/generate-venezuela-map.js` y volver a ejecutarlo
- **Regla de oro:** Nunca editar `frontend/public/` a mano. Todos los cambios deben hacerse vía scripts en `scripts/` para que sobrevivan un re-crawl
