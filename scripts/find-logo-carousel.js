const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');

const logoTerms = ['HMV', 'elecnor', 'SIEMENS', 'Axon'];
logoTerms.forEach(term => {
  const regex = new RegExp(term, 'gi');
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.log(`Found "${term}" at index ${match.index}:`);
    const start = Math.max(0, match.index - 500);
    const end = Math.min(content.length, match.index + 1000);
    console.log(content.substring(start, end));
    console.log("\n-------------------------------------------------\n");
    break; // Just print the first match context
  }
});
