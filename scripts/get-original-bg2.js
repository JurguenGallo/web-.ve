const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// b891596 is "fix(ui): correct slider overlapping text and duplicated arrows"  
// This was BEFORE our banner changes
const content = execSync('git show b891596:frontend/public/index.html', { cwd: rootDir, encoding: 'utf8' });

// Find background 2 of hero slider
const bg2Start = content.indexOf('data-public-id="2" data-mode="fill"');
const bg2End = content.indexOf('data-public-id="3"', bg2Start);
if (bg2Start !== -1) {
  console.log("Slide 2 background (from b891596 commit):");
  console.log(content.substring(bg2Start, bg2End || bg2Start + 1000));
}

// Also find background 1
const bg1Start = content.indexOf('data-public-id="1" data-mode="fill"');
const bg1End = content.indexOf('data-public-id="2" data-mode="fill"', bg1Start);
if (bg1Start !== -1) {
  console.log("\nSlide 1 background (from b891596 commit):");
  console.log(content.substring(bg1Start, bg1End || bg1Start + 1000));
}
