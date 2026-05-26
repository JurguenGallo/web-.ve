const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const id1 = 'v4jKxhYiQXlh';
const id2 = 'li3T5Vbe5XvC';

// Find the CSS rules for these ids. usually it's like div#n2-ss-17 .n-uc-v4jKxhYiQXlh { margin-top: 10px; top: 150px; }
// Or something similar. Let's just find the first occurrence of id1 and id2 in the style tag.
const styleStart = html.indexOf('<style');
const styleEnd = html.indexOf('</style>');

if (styleStart !== -1 && styleEnd !== -1) {
  let styles = html.substring(styleStart, styleEnd);
  
  // Find top or margin-top inside the block for id1
  const blockRegex1 = new RegExp(`\\.n-uc-${id1}[^{]*\\{([^}]+)\\}`);
  const blockRegex2 = new RegExp(`\\.n-uc-${id2}[^{]*\\{([^}]+)\\}`);
  
  const match1 = styles.match(blockRegex1);
  const match2 = styles.match(blockRegex2);
  
  if (match1 && match2) {
    const rules1 = match1[1];
    const rules2 = match2[1];
    
    console.log(`Rules 1: ${rules1}`);
    console.log(`Rules 2: ${rules2}`);
    
    // Replace margin-top in rules2 with the margin-top from rules1
    const marginMatch1 = rules1.match(/margin-top:([^;]+);/);
    if (marginMatch1) {
      const margin1 = marginMatch1[1];
      console.log(`Margin 1: ${margin1}`);
      
      const newRules2 = rules2.replace(/margin-top:([^;]+);/, `margin-top:${margin1};`);
      const newStyles = styles.replace(match2[0], match2[0].replace(rules2, newRules2));
      
      html = html.replace(styles, newStyles);
      fs.writeFileSync(indexFile, html, 'utf8');
      console.log('Fixed margin-top in CSS!');
    } else {
      console.log('Could not find margin-top in rules 1');
    }
  } else {
    console.log('Could not find CSS blocks for these classes.');
  }
}
