const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Check what the heading was in an early commit (before SEO changes)
const commits = ['7a37fa0', 'cfbe918', 'b34701a', '81ea0a2'];

for (const commit of commits) {
  try {
    const content = execSync(`git show ${commit}:frontend/public/index.html`, { cwd: rootDir, encoding: 'utf8' });
    const idx = content.indexOf('ltimos');
    if (idx !== -1) {
      const start = Math.max(0, idx - 200);
      const end = Math.min(content.length, idx + 300);
      const snippet = content.substring(start, end);
      if (snippet.includes('Proyectos') || snippet.includes('proyectos')) {
        console.log(`\n=== Commit ${commit} ===`);
        console.log(snippet);
      }
    }
  } catch (e) {
    console.error(`Error with commit ${commit}:`, e.message.substring(0, 100));
  }
}
