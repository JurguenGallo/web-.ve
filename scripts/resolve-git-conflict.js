const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const indexFile = path.join(rootDir, 'frontend', 'public', 'index.html');

console.log("Retrieving clean index.html from HEAD (b891596)...");
// Get the version of index.html from the branch we are rebasing onto (HEAD)
const headContent = execSync('git show HEAD:frontend/public/index.html', { cwd: rootDir, encoding: 'utf8' });

console.log("Applying changes...");
let resolved = headContent;

// 1. Change the map image from Colombia (Presentes5.png) to Venezuela (portada-venezuela.png)
if (resolved.includes('Presentes5.png')) {
  resolved = resolved.replace(/Presentes5\.png/g, 'portada-venezuela.png');
  console.log("- Replaced Presentes5.png with portada-venezuela.png");
} else {
  console.log("- WARNING: Presentes5.png not found!");
}

// 2. Change the button container class name to match our custom style target
if (resolved.includes('li3T5Vbe5XvC')) {
  resolved = resolved.replace(/li3T5Vbe5XvC/g, 'v4jKxhYiQXlh');
  console.log("- Replaced class li3T5Vbe5XvC with v4jKxhYiQXlh");
} else {
  console.log("- WARNING: Class li3T5Vbe5XvC not found!");
}

// 3. Inject our custom styles before </head> or after the existing style block
const targetStyle = `  /* Fix overlapping slider widgets */
  .nextend-indicator-pie { display: none !important; }
</style>`;

const newStyle = `  /* Fix overlapping slider widgets */
  .nextend-indicator-pie { display: none !important; }
</style>
<style>
  /* Empujar botones del slider hacia abajo */
  .n-uc-v4jKxhYiQXlh {
    margin-top: 50px !important;
  }
</style>`;

if (resolved.includes(targetStyle)) {
  resolved = resolved.replace(targetStyle, newStyle);
  console.log("- Injected button margin style block");
} else {
  // Fallback: search without the indentation/newlines
  const targetStyleCompact = `.nextend-indicator-pie { display: none !important; }</style>`;
  const newStyleCompact = `.nextend-indicator-pie { display: none !important; }</style><style>.n-uc-v4jKxhYiQXlh { margin-top: 50px !important; }</style>`;
  if (resolved.includes(targetStyleCompact)) {
    resolved = resolved.replace(targetStyleCompact, newStyleCompact);
    console.log("- Injected button margin style block (compact)");
  } else {
    // Fallback 2: just insert before </head>
    resolved = resolved.replace('</head>', '<style>.n-uc-v4jKxhYiQXlh { margin-top: 50px !important; }</style></head>');
    console.log("- Injected button margin style block before </head>");
  }
}

// 4. Update the "Inicio" links to point to "/"
// The navigation links originally have href="" or href="#" or href="/index.html". Let's fix them to "/"
// Let's use the regex from fix-inicio-link.js
const navRegex = /<a href="[^"]*">Inicio<\/a>/g;
let count = 0;
resolved = resolved.replace(navRegex, (match) => {
  count++;
  return '<a href="/">Inicio</a>';
});
console.log(`- Fixed ${count} 'Inicio' navigation links`);

// Write the resolved file back
fs.writeFileSync(indexFile, resolved, 'utf8');
console.log("Successfully resolved conflict and wrote index.html!");
