const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Let's see what the original text was in git history
try {
  const log = execSync('git log --oneline -n 20', { cwd: rootDir, encoding: 'utf8' });
  console.log("Git log:\n", log);
} catch (e) {
  console.error(e.message);
}
