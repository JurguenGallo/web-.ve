const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const content = execSync('git show b891596:frontend/public/index.html', { cwd: rootDir, encoding: 'utf8' });

// Find background 2 of hero slider - try a different approach
const searchTerm = 'data-public-id="2" data-mode="fill"';
const idx = content.indexOf(searchTerm);
if (idx !== -1) {
  console.log("Background 2 at index:", idx);
  console.log(content.substring(idx, idx + 1200));
} else {
  console.log("Background 2 not found in b891596");
  // Try to find by Presentes768
  const idx768 = content.indexOf('Presentes768');
  if (idx768 !== -1) {
    console.log("\nPresentes768 found at index:", idx768);
    console.log(content.substring(Math.max(0, idx768 - 500), idx768 + 500));
  } else {
    console.log("Presentes768 also not found!");
  }
}
