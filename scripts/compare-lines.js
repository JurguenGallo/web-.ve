const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const lines = content.split('\n');

const line8 = lines[7]; // 0-based index 7
const line19 = lines[18]; // 0-based index 18

console.log("Line 8 length:", line8.length);
console.log("Line 19 length:", line19.length);

if (line8 === line19) {
  console.log("They are identical!");
} else {
  console.log("They are different!");
  // Find where they differ
  let diffIndex = -1;
  for (let i = 0; i < Math.min(line8.length, line19.length); i++) {
    if (line8[i] !== line19[i]) {
      diffIndex = i;
      break;
    }
  }
  console.log(`Differ at index ${diffIndex}`);
  console.log("Line 8 diff start:", line8.substring(diffIndex, diffIndex + 100));
  console.log("Line 19 diff start:", line19.substring(diffIndex, diffIndex + 100));
}
