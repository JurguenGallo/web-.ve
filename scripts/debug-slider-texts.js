const fs = require('fs');
const { execSync } = require('child_process');

try {
  const oldHtml = execSync('git show b891596~1:frontend/public/index.html', {encoding: 'utf8'});
  
  // Extract text from slides to see what they were
  const slides = [...oldHtml.matchAll(/data-slide-public-id="([^"]+)"[^>]*>([\s\S]*?)<\/div><div data/g)];
  
  if (slides.length === 0) {
     const slides2 = [...oldHtml.matchAll(/<div[^>]*data-slide-public-id="([^"]+)"[^>]*>([\s\S]*?)(?=<div[^>]*data-slide-public-id=|$)/g)];
     slides2.forEach(s => {
       console.log('Slide', s[1]);
       const texts = [...s[2].matchAll(/<div[^>]*n2-ss-text[^>]*>([^<]+)<\/div>/g)].map(m => m[1]);
       console.log('Texts:', texts);
     });
  }

} catch(e) {
  console.log('Error git show');
}
