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
- **Reorganización del Banner de Venezuela:** Se movió la imagen original `Portada de pagina web.png` de la raíz al directorio de recursos del sitio en `wp-content/uploads/2026/portada-venezuela/`. Posteriormente, se actualizó la ruta de la primera diapositiva del banner principal en `index.html` para que apunte a este nuevo recurso.
- **Actualización de la página Contacto:** Se corrigió el texto de la dirección de Venezuela a un formato más natural, se restauró la imagen original del mapa de Colombia para no crear expectativas erróneas, y se actualizaron los números a "18 años" y "+120 proyectos". Además, se ajustó el iframe del mapa de Google a `width="100%"` para hacerlo responsivo y centrado correctamente.
- **Corrección de imágenes en "Trabaja con nosotros":** Se solucionó un problema de imágenes rotas que ocurría debido a etiquetas `<picture>` con rutas dinámicas hacia versiones de resoluciones inexistentes. Se configuró para que siempre carguen las versiones `.webp` válidas y de alta calidad alojadas en el caché local en cualquier tipo de pantalla.

---

## Sesión 5 — 2026-05-26

### 12. Ajustes finales y sincronización con GitHub
- **Año actualizado:** Se cambió COPYRIGHT 2025 → 2026 en las 8 páginas del sitio.
- **Portafolio actualizado:** PORTAFOLIO DE SERVICIOS 2025 → 2026 en quienes-somos y alquilerequiposelectricos.
- **Experiencia actualizada:** "17 años" → "18 años" en index y quienes-somos.
- **Contadores corregidos:** Personal de campo 60 → +100, administrativo 27 → 30 en quienes-somos.
- **Búsqueda eliminada:** Se removió la lupa (ícono de búsqueda) y la barra de búsqueda del menú de navegación en todas las páginas.
- **Mapa de Colombia restaurado:** Se actualizó contacto con el mapa de Colombia (`colombia-sim.png`) y las direcciones de ambas sedes (Colombia + Venezuela), aplicando la corrección del width del iframe (100%).
- **Resolución de conflictos:** Se hizo pull de GitHub, se resolvieron conflictos de merge en contacto y trabaja-con-nosotros, y se aplicaron las mejoras del colega sobre las nuestras.
- **Ajuste botón COTIZA AQUÍ:** Se bajó el botón "COTIZA AQUÍ" del slider de galería con `margin-top: 40px` (slide 1 - Presentes5).
- **Espaciado contadores en contacto:** Se redujo el espacio entre el título "¡CON PRESENCIA INTERNACIONAL!" y los contadores (18 años, +120 proyectos) con `margin-top: -30px` en el row de contadores.

---

## Sesión 6 — 2026-05-26

### 13. Ajuste de posición, tamaño y espaciado en título de Contacto
- **Alineación y Margen Superior:** Se agregó un margen superior dinámico al título `"¡CON PRESENCIA INTERNACIONAL!"` en `contacto/index.html` utilizando `margin-top: clamp(20px, 6vw, 80px);`. Esto desplaza el título hacia abajo, rellenando el espacio vacío que quedaba arriba de los contadores y equilibrando el diseño visual de la sección respecto al mapa lateral.
- **Aumento de Tamaño de Fuente:** Se incrementó ligeramente el tamaño de la fuente de `clamp(1.5rem, 3.5vw, 3rem)` a `clamp(1.8rem, 4.2vw, 3.5rem)` para mejorar la legibilidad y presencia del título principal.
- **Reducción de Separación Vertical:** Se eliminaron los márgenes y rellenos excesivos de las filas internas de Divi (`.et_pb_row_inner_0` y `.et_pb_row_inner_1`), y se redujo el `margin-bottom` del `<h1>` a `10px`. Adicionalmente, se limpiaron los paddings/margins de la columna interna (`.et_pb_column_inner_0`) y del módulo de texto (`.et_pb_text_5`), aplicando un margen superior negativo de `-50px !important` en la fila de contadores (`.et_pb_row_inner_1`) para unirlos físicamente y eliminar la separación de raíz.
- **Automatización en Scripts:** Se actualizó `scripts/neutralize-content.js` para asegurar que este formato estilizado, posicionado y con espaciados ajustados sea aplicado de manera automática en futuros re-crawls de la página.

---


## Sesión 7 — 2026-05-26

### 14. Reemplazo del Feed de Instagram y Automatización
- **Grilla Estática Premium:** Reemplazamos el plugin Spotlight en `galeria/index.html` por una grilla responsiva premium de 3x3 de proyectos reales de SIM Energy, enlazada a Instagram con efectos hover modernos.
- **Limpieza de Scripts:** Removimos scripts y estilos en desuso de Spotlight para aligerar la carga de la página.
- **Automatización:** Integramos el reemplazo y la limpieza de Spotlight en `scripts/neutralize-content.js` para asegurar que los cambios se mantengan en re-crawls.
- **Resolución de Conflictos:** Sincronizamos con GitHub mediante pull --rebase y aplicamos la persistencia en `neutralize-content.js` sin problemas, restaurando el ocultamiento del mapa de Colombia en `contacto/index.html`.

---

## Sesión 8 — 2026-05-27

### 15. Cambio de imagen en Slide 2 de Soluciones Fotovoltaicas
- **Actualización de imagen:** Se reemplazó la imagen `Presentes768.png` (Slide 2 del banner principal) de "Nuevo Servicio Soluciones Fotovoltaicas" por una versión actualizada que muestra únicamente "Soluciones Fotovoltaicas", eliminando la referencia a "Nuevo Servicio".

---

## Sesión 9 — 2026-05-27

### 16. Corrección de calculadora fotovoltaica en Soluciones Fotovoltaicas
- **Botones de la calculadora:** Se reemplazaron los atributos `onclick="return!1"` y `data-rocket-onclick="fn()"` por `onclick="fn()"` directo en los 3 botones (Calcular, Reiniciar, Eliminar selección), ya que `data-rocket-onclick` solo funciona con WP Rocket activo y el sitio es estático.
- **Script de la calculadora:** Se cambió `type="rocketlazyloadscript"` a `type="text/javascript"` para que el JavaScript se ejecute sin necesidad de WP Rocket.
- **Carga de Google Maps:** Se cambió `data-rocket-src` a `src` en el script de la API de Google Maps para que cargue correctamente en entorno estático.

---

## Sesión 10 — 2026-05-27

### 17. Actualización de enlace del Portafolio de Servicios 2026
- **Cambio de ruta:** Se reemplazó el enlace del Google Drive (`https://drive.google.com/file/d/10uEUJkZNa8M-b34cm0m5p9h4syUtuyyQ/view?usp=share_link`) por la ruta local del PDF en `/wp-content/uploads/2026/Portafolio%20SIM%202026.pdf` en la página ¿Quiénes somos?.

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
