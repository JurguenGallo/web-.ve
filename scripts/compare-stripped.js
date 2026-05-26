const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
const content = fs.readFileSync(indexFile, 'utf8');
const lines = content.split('\n');

const line8 = lines[7]; // Line 8
const line19 = lines[18]; // Line 19

const stripped8 = line8.substring(8); // Strip "</style>" (8 chars: <, /, s, t, y, l, e, >)

console.log("stripped8 length:", stripped8.length);
console.log("line19 length:", line19.length);

if (stripped8 === line19) {
  console.log("They are identical after stripping </style>!");
} else {
  console.log("They are different!");
  let diffIndex = -1;
  for (let i = 0; i < Math.min(stripped8.length, line19.length); i++) {
    if (stripped8[i] !== line19[i]) {
      diffIndex = i;
      break;
    }
  }
  console.log(`Differ at index ${diffIndex}`);
  console.log("stripped8 diff:", stripped8.substring(diffIndex, diffIndex + 100));
  console.log("line19 diff:", line19.substring(diffIndex, diffIndex + 100));
}
