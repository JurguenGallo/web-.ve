const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
let html = fs.readFileSync(galeriaFile, 'utf8');

// The slides are inside <div class="n2-ss-slider-1 ..."> or similar.
// Each slide is usually a <div class="n2-ss-slide ...">.
// Let's use cheerio to find the slides.
const $ = cheerio.load(html, { decodeEntities: false });

const slides = $('div.n2-ss-slide');
console.log(`Found ${slides.length} slides.`);

if (slides.length > 0) {
  // Clone the first slide
  const firstSlide = $(slides[0]);
  const newSlide = firstSlide.clone();

  // Change the background image to portada-venezuela.png
  // It's inside a <picture> or <img> tag.
  newSlide.find('img').each((i, img) => {
    const src = $(img).attr('src');
    if (src && src.includes('Presentes5.png')) {
      $(img).attr('src', '/wp-content/uploads/2025/03/portada-venezuela.png');
    }
  });

  // We also need to change the style background-image if it exists
  newSlide.find('[style*="Presentes5.png"]').each((i, el) => {
    let style = $(el).attr('style');
    style = style.replace(/Presentes5\.png/g, 'portada-venezuela.png');
    $(el).attr('style', style);
  });
  
  // Smart slider also uses inline data attributes like data-desktop="..."
  newSlide.find('[data-desktop*="Presentes5.png"]').each((i, el) => {
    let attr = $(el).attr('data-desktop');
    attr = attr.replace(/Presentes5\.png/g, 'portada-venezuela.png');
    $(el).attr('data-desktop', attr);
  });

  // Since we cloned it, we might need to change IDs to avoid duplicates if Smart Slider relies on them.
  // But usually Smart Slider uses classes and data attributes for dynamic slides.
  // Let's append the new slide right after the first one.
  firstSlide.after(newSlide);
  
  html = $.html();
  fs.writeFileSync(galeriaFile, html, 'utf8');
  console.log('Successfully duplicated slide and added Venezuela banner.');
} else {
  console.log('Could not find any slides.');
}
