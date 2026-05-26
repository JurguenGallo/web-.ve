const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const lines = content.split('\n');

const line8 = lines[7];
const line19 = lines[18];
const stripped8 = line8.substring(8);

let diffs = [];
let i = 0;
let j = 0;

while (i < stripped8.length || j < line19.length) {
  if (stripped8[i] !== line19[j]) {
    // Show context
    diffs.push({
      idx8: i,
      idx19: j,
      char8: stripped8.substring(i, i + 20),
      char19: line19.substring(j, j + 20)
    });
    // Align them by finding next match of a 10-char anchor
    let found = false;
    for (let offset = 1; offset < 100; offset++) {
      const anchor = line19.substring(j + offset, j + offset + 15);
      const matchIdx = stripped8.indexOf(anchor, i);
      if (matchIdx !== -1) {
        i = matchIdx;
        j = j + offset;
        found = true;
        break;
      }
    }
    if (!found) {
      // try the other way
      for (let offset = 1; offset < 100; offset++) {
        const anchor = stripped8.substring(i + offset, i + offset + 15);
        const matchIdx = line19.indexOf(anchor, j);
        if (matchIdx !== -1) {
          i = i + offset;
          j = matchIdx;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      console.log("Could not align after index", i, j);
      break;
    }
  } else {
    i++;
    j++;
  }
}

console.log("Number of diffs found:", diffs.length);
diffs.forEach((d, index) => {
  console.log(`Diff ${index + 1}:`);
  console.log(`  stripped8 index ${d.idx8}: ${JSON.stringify(d.char8)}`);
  console.log(`  line19 index ${d.idx19}: ${JSON.stringify(d.char19)}`);
});
