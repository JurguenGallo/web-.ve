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
│   ├── download_missing_images.js
│   ├── fix_assets_final.js
│   ├── fix_everything.js
│   ├── fix_seo.js
│   ├── make_paths_relative.js
│   ├── replace_domain_globally.js
│   ├── download-site.js
│   └── extract-pdf.js
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
- [ ] Crear sitemap.xml funcional
- [ ] Agregar más H2/H3 con keywords de servicios en la homepage
- [ ] Optimizar HTML (minificar, comprimir)
- [ ] Agregar blog/páginas de contenido editorial

---

## Notas importantes

- **Divi** es tema premium — se necesita licencia para activarlo en el .ve
- **Nextend Smart Slider Pro** y **Yoast SEO Premium** requieren licencias separadas
- Los formularios (WPForms, Gravity Forms) no funcionan en estático — toca reemplazarlos por formularios HTML/JS simples o un servicio externo (Netlify Forms, Formspree)
- El sitio actual tiene 8.5MB — ideal optimizar imágenes para producción
