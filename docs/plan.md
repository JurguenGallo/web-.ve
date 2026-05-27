# Plan de Trabajo - Clon SIM Energy Venezuela

Este documento define la planificación para adaptar el sitio web clonado de SIM Energy (www.simenergy.com.co) para el mercado venezolano (www.simenergy.com.ve), asegurando una transición de identidad visual, contexto geográfico y optimizaciones técnicas.

## Objetivos del Proyecto
1. **Identidad Visual y Contexto Geográfico:** Adaptar referencias a Colombia para dar cabida a Venezuela (ej. mapa de la portada, textos geográficos).
2. **Neutralidad de Marca ("Quienes Somos"):** Rediseñar la narrativa institucional de la empresa para proyectarla como una firma colombiana nacida en Norte de Santander en expansión internacional hacia Venezuela, demostrando crecimiento sin perder sus orígenes.
3. **Correcciones SEO y Accesibilidad:** Resolver los errores críticos del informe SEO (alt texts, etiquetas H1 duplicadas, schemas, viewport).
4. **Dominio y Redirecciones:** Asegurar que todos los enlaces apunten al dominio `.com.ve`.

## Fases de Implementación
1. **Fase 1: Corrección SEO Crítica (Completado)**
   - Corregir textos alternativos de imágenes principales.
   - Ajustar H1 duplicados en la página de inicio.
   - Configurar Schema JSON-LD adaptado.
   - Optimizar el viewport y metadatos sociales.
2. **Fase 2: Formateo y Limpieza CSS (Completado)**
   - Corregir falsos positivos en VS Code aplicando formato con Prettier a los archivos CSS minificados.
3. **Fase 3: Neutralización y Tropicalización de Contenido (Completado)**
   - Adaptar la página "Quiénes somos" para una identidad de marca más neutra e internacional (origen Cúcuta/Norte de Santander, expansión a Venezuela).
   - Reemplazar enlaces y referencias del dominio `.com.co` a `.com.ve` globalmente.
4. **Fase 4: Integración del Mapa y Ajustes de UX (Completado / En espera de teléfonos)**
   - Reemplazar la silueta de Colombia por la de Venezuela en el banner principal y en Contacto.
   - Reparar navegación al inicio y espaciado de botones.
   - Configurar teléfonos y direcciones específicas de Venezuela (pendiente de confirmación final).
5. **Fase 5: Incorporación de Slider Eólico y Reorganización de Diapositivas (Completado)**
   - Integrar la diapositiva eólica (`Eolica.png`) en el inicio como la tercera y última diapositiva (enlazando a `/energia-renovables/`).
   - Integrar la diapositiva eólica en la galería como el tercer slide.
   - Desplazar la diapositiva de Venezuela en la galería para que pase a ser el cuarto slide.
   - Automatizar todo mediante scripts robustos en Node.js usando Cheerio.


