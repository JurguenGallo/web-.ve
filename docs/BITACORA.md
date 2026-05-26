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

## Sesión 3 — 2026-05-26

### 10. Corrección de Navegación, Espaciado de Botones y Banner de Venezuela
- **Navegación de "Inicio":** Se repararon los enlaces vacíos (`href=""`) del botón "Inicio" en el menú de navegación de todas las páginas del sitio, redireccionándolo a la raíz (`/`) para que funcione correctamente e igual que el logo corporativo.
- **Espaciado de Botones en Banner Principal:** Se aplicó una regla de estilo CSS en la página de inicio para empujar los botones principales hacia abajo, evitando que queden muy pegados a los textos y títulos superiores en pantallas de escritorio y móvil.
- **Banner de Venezuela en la Homepage:** Se implementó y adaptó por completo la imagen del mapa de Venezuela (`portada-venezuela.png`) en el banner de la página de inicio, reemplazando la imagen de Colombia (`Presentes5.png` y `Presentes768.png`) tanto en la versión de escritorio como en la móvil, asegurando que sea consistente en todos los dispositivos.
- **Resolución de Conflictos en Git:** Se resolvieron los conflictos de combinación en el archivo `index.html` generados por el rebase con el repositorio remoto, preservando todas las optimizaciones locales de SEO, estructura y diseño, y se subieron los cambios exitosamente a GitHub.
- **Reemplazo del Carrusel de Logos por uno CSS Infinito:** Se eliminó el slider de Smart Slider 3 para los logos de aliados/clientes (que presentaba bugs aleatorios en la exportación estática) en todas las páginas del sitio (`alquilerequiposelectricos`, `energia-renovables`, `quienes-somos`, `solucionesfotovoltaicas` e `index.html`). Se reemplazó por un carrusel marquesina infinitamente desplazable hecho 100% en CSS, el cual es 100% estable, fluido (acelerado por GPU) y responsivo.
- **Restauración de Fondo en Diapositiva 2:** Se identificó que la imagen `Presentes768.png` (de resolución original `2286x1024`) no era una versión móvil, sino la imagen de fondo técnica y con el gráfico solar específica del Slide 2 ("Soluciones Fotovoltaicas") de la versión original colombiana. Se revirtió el cambio que la había sobrescrito por `portada-venezuela.png`, devolviendo su fondo original neutro para permitir el correcto desplazamiento visual entre las dos portadas.

---

## Sesión 4 — 2026-05-26

### 11. Actualización de "¿Quiénes somos?" — Expansión Venezuela
- **Texto principal:** Se reescribió el párrafo de quienes-somos para indicar "origen en Norte de Santander, Colombia" y agregar la meta de expansión completa en Venezuela para **2027**.
- **Dirección oficina:** Se agregó la dirección física: "Oficina N° 71, Piso 7, Torre Sofitasa, 7ma Avenida c/c Calle 10, San Cristóbal, Táchira" tanto en el texto principal como en el footer de las 4 páginas que tienen columna de contacto (quienes-somos, solucionesfotovoltaicas, galeria, energia-renovables).
- **Sección POLÍTICAS:** Se dividió en 2 columnas independientes de igual ancho, cada una con su título y botón ("POLÍTICAS SISTEMA INTEGRADO" y "ALCOHOL, DROGAS Y TABAQUISMO") para evitar confusión de botones duplicados.
- **Correo electrónico:** Se actualizó `gerencia@simenergy.com.ve` → `gerencia@simenergy.com` en todas las páginas.
- **"17 años" → "18 años":** Se actualizó la trayectoria en quienes-somos.
- **Corrección de Color en Botón Flotante de WhatsApp:** Se cambió el color de la animación y del botón expandido al hacer hover (pasar el mouse). Originalmente cambiaba a un color azul corporativo (`#224982`), y se modificó para que mantenga un color verde WhatsApp (`#20ba5a`, un tono verde ligeramente más oscuro para el efecto hover) en todas las páginas de la web.

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
