const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const html = fs.readFileSync(indexFile, 'utf8');

// Print background 2 in n2-ss-17
const bg2Start = html.indexOf('data-public-id="2" data-mode="fill"');
if (bg2Start !== -1) {
  const bg2End = html.indexOf('</div></div></div>\n</div>', bg2Start);
  console.log("Current bg2 HTML:");
  console.log(html.substring(bg2Start, bg2End || bg2Start + 800));
}

// Also print slide 2 to see what button it has and confirm it's the "COTIZA AQUÍ" slide
const slide2Start = html.indexOf('data-id="73"');
if (slide2Start !== -1) {
  // Find button text
  const btnSearch = html.indexOf('COTIZA', slide2Start);
  const conoceSearch = html.indexOf('CONOCE', slide2Start);
  console.log("\nSlide 2 has COTIZA button at index:", btnSearch);
  console.log("Slide 2 has CONOCE button at index:", conoceSearch);
  
  // Check data-sstype="content" for slide 2
  const slideEnd = html.indexOf('class="n2-ss-slide n2-ow n2-ss-slide-88', slide2Start);
  if (slideEnd !== -1 && slideEnd > slide2Start) {
    const slide2Html = html.substring(slide2Start, slideEnd);
    // Find any image references
    const imgRefs = slide2Html.match(/src="[^"]*"/g) || [];
    console.log("\nImage references in slide 2:");
    imgRefs.forEach(ref => console.log(" ", ref));
  }
}
