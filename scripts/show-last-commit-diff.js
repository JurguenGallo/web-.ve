const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');
try {
  const diff = execSync('git diff HEAD^ HEAD -- frontend/public/galeria/index.html', { cwd: rootDir, encoding: 'utf8' });
  console.log("Diff length:", diff.length);
  console.log(diff.substring(0, 1000));
} catch (e) {
  console.error("Error:", e.message);
}
