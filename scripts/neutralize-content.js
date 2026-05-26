const fs = require('fs');
const path = require('path');

const SITE = path.join(__dirname, '..', 'frontend', 'public');

const htmlFiles = [
  'index.html',
  'quienes-somos/index.html',
  'solucionesfotovoltaicas/index.html',
  'alquilerequiposelectricos/index.html',
  'galeria/index.html',
  'contacto/index.html',
  'trabaja-con-nosotros/index.html',
  'energia-renovables/index.html',
];

let totalChanges = 0;

htmlFiles.forEach(relPath => {
  const fullPath = path.join(SITE, relPath);
  if (!fs.existsSync(fullPath)) return;

  let html = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // 1. Replace contact page headline
  if (html.includes('¡PRESENTES EN VARIAS CIUDADES DE <span style="color: #fcc92f;">COLOMBIA</span>!')) {
    html = html.replace(
      '¡PRESENTES EN VARIAS CIUDADES DE <span style="color: #fcc92f;">COLOMBIA</span>!',
      '¡CON PRESENCIA <span style="color: #fcc92f;">INTERNACIONAL</span>!'
    );
    changed = true;
  }

  // Apply correct size, margin-top and wrapping styles to contact/index.html header
  const targetHeader = '<h1 style="text-align: center; font-size: clamp(1.8rem, 4.2vw, 3.5rem); letter-spacing: -1px; line-height: 1.2; margin-top: clamp(20px, 6vw, 80px); margin-bottom: 10px;">¡CON PRESENCIA <br><span style="color:#fcc92f; white-space: nowrap;">INTERNACIONAL!</span></h1>';
  if (html.includes('¡CON PRESENCIA') && (!html.includes('margin-top: clamp(20px') || html.includes('margin-bottom: clamp(15px'))) {
    html = html.replace(/<h1[^>]*>¡CON PRESENCIA.*?<\/h1>/gi, targetHeader);
    changed = true;
  }

  // Adjust inner row padding and margins in contacto to close the vertical gap
  if (html.includes('<div class="et_pb_row_inner et_pb_row_inner_0">') && !html.includes('et_pb_row_inner_0" style="padding-bottom: 0px')) {
    html = html.replace(
      '<div class="et_pb_row_inner et_pb_row_inner_0">',
      '<div class="et_pb_row_inner et_pb_row_inner_0" style="padding-bottom: 0px !important; margin-bottom: 0px !important;">'
    );
    changed = true;
  }
  if (html.includes('<div class="et_pb_row_inner et_pb_row_inner_1 et_animated et_pb_gutters1">') && !html.includes('margin-top: -50px')) {
    html = html.replace(
      '<div class="et_pb_row_inner et_pb_row_inner_1 et_animated et_pb_gutters1">',
      '<div class="et_pb_row_inner et_pb_row_inner_1 et_animated et_pb_gutters1" style="padding-top: 0px !important; margin-top: -50px !important;">'
    );
    changed = true;
  } else if (html.includes('margin-top: 0px !important;')) {
    html = html.replace('margin-top: 0px !important;', 'margin-top: -50px !important;');
    changed = true;
  }

  // Clear padding/margin on column_inner_0 and text_5 to close the gap
  const targetCol = '<div class="et_pb_column et_pb_column_4_4 et_pb_column_inner et_pb_column_inner_0 et-last-child">';
  if (html.includes(targetCol) && !html.includes('et_pb_column_inner_0 et-last-child" style=')) {
    html = html.replace(
      targetCol,
      '<div class="et_pb_column et_pb_column_4_4 et_pb_column_inner et_pb_column_inner_0 et-last-child" style="margin-bottom: 0px !important; padding-bottom: 0px !important;">'
    );
    changed = true;
  }

  const targetText = '<div class="et_pb_module et_pb_text et_pb_text_5 et_pb_text_align_left et_pb_bg_layout_light">';
  if (html.includes(targetText) && !html.includes('et_pb_text_5 et_pb_text_align_left et_pb_bg_layout_light" style=')) {
    html = html.replace(
      targetText,
      '<div class="et_pb_module et_pb_text et_pb_text_5 et_pb_text_align_left et_pb_bg_layout_light" style="margin-bottom: 0px !important; padding-bottom: 0px !important;">'
    );
    changed = true;
  }

  // 2. Hide Colombia map image in contact page
  if (html.includes('colombia-sim.png') && !html.includes('display:none;')) {
    // Replace the picture tag containing the colombia map with a hidden version
    // A simple way is to find the picture tag around the colombia-sim.png and hide its wrapper or image
    html = html.replace(/<picture[^>]*>\s*<source[^>]*colombia-sim\.png\.webp[^>]*>\s*<img[^>]*colombia-sim\.png[^>]*>\s*<\/picture>/gi, match => {
       return `<div style="display:none;">${match}</div>`;
    });
    // In case the structure is different, add display none directly to the img
    html = html.replace(/(<img[^>]*src="[^"]*colombia-sim\.png"[^>]*)>/gi, '$1 style="display:none;">');
    changed = true;
  }

  // 3. Update the footer address
  const footerAddressOld = 'Avenida 18 #18-29 La Libertad, Cúcuta - Norte de santander (Colombia)';
  const footerAddressNew = 'Operaciones en Venezuela - Sede origen en Colombia';
  if (html.includes(footerAddressOld)) {
    html = html.replaceAll(footerAddressOld, footerAddressNew);
    changed = true;
  }

  // 4. Replace Instagram feed with premium static grid in galeria/index.html
  if (relPath === 'galeria/index.html') {
    const startStr = '<div class="spotlight-instagram-feed"';
    const endStr = '<input type="hidden" id="sli__m__585f11ac" data-json="[]">';
    
    if (html.includes(startStr) && html.includes(endStr)) {
      const startIdx = html.indexOf(startStr);
      const endIdx = html.indexOf(endStr);
      const fullEndIdx = endIdx + endStr.length;
      const targetText = html.substring(startIdx, fullEndIdx);
      
      const widgetHTML = `<!-- SIM Energy Premium Instagram Feed Widget -->
<div class="sim-instagram-widget" style="width: 340px; height: 545px; background: #ffffff; border: 1px solid #e1e8ed; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0 auto; text-align: left;">
  
  <!-- Header -->
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #efefef; height: 60px; box-sizing: border-box; background: #fafafa;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <img src="/wp-content/uploads/2025/02/logo-sim2025.png" alt="SIM Energy logo" style="width: 36px; height: 36px; border-radius: 50%; border: 1px solid #dbdbdb; object-fit: contain; background: #fff;" />
      <div style="display: flex; flex-direction: column;">
        <span style="font-weight: 600; font-size: 14px; color: #262626; line-height: 1.2; display: flex; align-items: center; gap: 3px;">
          simenergysas
          <svg style="color: #0095f6; width: 14px; height: 14px; display: inline-block; vertical-align: middle;" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </span>
        <span style="font-size: 11px; color: #8e8e8e;">SIM Energy</span>
      </div>
    </div>
    <a href="https://www.instagram.com/simenergysas/" target="_blank" style="background: #0095f6; color: #ffffff; border: none; border-radius: 4px; padding: 5px 12px; font-size: 12px; font-weight: 600; text-decoration: none; display: inline-block; cursor: pointer; transition: background 0.2s;">Seguir</a>
  </div>

  <!-- Grid of 9 photos -->
  <style>
    .instagram-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 4px;
      background: #ffffff;
      box-sizing: border-box;
      flex-grow: 1;
    }
    .instagram-item {
      position: relative;
      width: 100%;
      padding-top: 100%;
      overflow: hidden;
      cursor: pointer;
      border-radius: 4px;
      background: #fafafa;
    }
    .instagram-item img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .instagram-item:hover img {
      transform: scale(1.08);
    }
    .instagram-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.25s ease;
      z-index: 2;
    }
    .instagram-item:hover .instagram-overlay {
      opacity: 1;
    }
    .instagram-overlay svg {
      width: 24px;
      height: 24px;
      color: #ffffff;
    }
  </style>

  <div class="instagram-grid">
    <!-- Item 1 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/03/Presentes5.png" alt="Instalaciones de Ingeniería Eléctrica SIM Energy" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
    <!-- Item 2 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/03/Presentes768.png" alt="Proyectos Eléctricos Industriales" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
    <!-- Item 3 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/03/fotovoltaicas.png" alt="Sistemas de Energía Solar Fotovoltaica" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
    <!-- Item 4 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/03/Bateria-solar.png" alt="Baterías y Almacenamiento Solar" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
    <!-- Item 5 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/03/PANELES.png" alt="Instalación de Paneles Solares Premium" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
    <!-- Item 6 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/03/alquiler-banner.png" alt="Alquiler de Plantas y Equipos Eléctricos" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
    <!-- Item 7 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/03/quienes-somos1.png" alt="Equipo de Profesionales SIM Energy" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
    <!-- Item 8 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/03/Panel-solar.png" alt="Mantenimiento de Sistemas Fotovoltaicos" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
    <!-- Item 9 -->
    <a href="https://www.instagram.com/simenergysas/" target="_blank" class="instagram-item">
      <img src="/wp-content/uploads/2025/06/grua.png" alt="Obras Civiles y Montajes Industriales" />
      <div class="instagram-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </div>
    </a>
  </div>

  <!-- Footer -->
  <div style="padding: 12px 16px; border-top: 1px solid #efefef; height: 135px; box-sizing: border-box; background: #fafafa; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
    <div style="display: flex; justify-content: space-around; text-align: center;">
      <div>
        <div style="font-weight: 600; font-size: 14px; color: #262626;">339</div>
        <div style="font-size: 11px; color: #8e8e8e; text-transform: uppercase; letter-spacing: 0.5px;">Posts</div>
      </div>
      <div>
        <div style="font-weight: 600; font-size: 14px; color: #262626;">+15k</div>
        <div style="font-size: 11px; color: #8e8e8e; text-transform: uppercase; letter-spacing: 0.5px;">Seguidores</div>
      </div>
    </div>
    <a href="https://www.instagram.com/simenergysas/" target="_blank" style="background: #224982; color: #ffffff; text-align: center; border: none; border-radius: 4px; padding: 8px; font-size: 12px; font-weight: 600; text-decoration: none; display: block; transition: background 0.2s;">
      Ver en Instagram
    </a>
  </div>
</div>`;
      html = html.replace(targetText, widgetHTML);
      changed = true;
    }
    
    // Clean up spotlight css
    const cssPatterns = [
      /<link[^>]*id="sli-common-vendors-css"[^>]*>/gi,
      /<link[^>]*id="sli-common-css"[^>]*>/gi,
      /<link[^>]*id="sli-feed-css"[^>]*>/gi,
      /<link[^>]*id="sli-front-css"[^>]*>/gi
    ];
    cssPatterns.forEach(pattern => {
      if (pattern.test(html)) {
        html = html.replace(pattern, '');
        changed = true;
      }
    });
    
    // Clean up spotlight js
    const jsPatterns = [
      /<script[^>]*id="sli-runtime-js"[^>]*><\/script>/gi,
      /<script[^>]*id="sli-common-vendors-js"[^>]*><\/script>/gi,
      /<script[^>]*id="sli-common-js-extra"[^>]*>[\s\S]*?<\/script>/gi,
      /<script[^>]*id="sli-common-js"[^>]*><\/script>/gi,
      /<script[^>]*id="sli-feed-js"[^>]*><\/script>/gi,
      /<script[^>]*id="sli-front-js"[^>]*><\/script>/gi
    ];
    jsPatterns.forEach(pattern => {
      if (pattern.test(html)) {
        html = html.replace(pattern, '');
        changed = true;
      }
    });
  }

  if (changed) {
    fs.writeFileSync(fullPath, html);
    console.log(`  Neutralized: ${relPath}`);
    totalChanges++;
  }
});

console.log(`\nNeutralization complete! Applied changes to ${totalChanges} file(s).`);
