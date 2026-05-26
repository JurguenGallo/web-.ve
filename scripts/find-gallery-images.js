const fs = require('fs');
const path = require('path');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');

const regex = /[^"'()]*\.(png|webp|jpg|jpeg)[^"'()]*'/gi;
const matches = content.match(/[\w\-_\/]+\.(png|webp|jpg|jpeg)/gi) || [];

console.log("Found image names:", matches.length);
const uniqueMatches = [...new Set(matches)];
console.log("Unique image names:", uniqueMatches.slice(0, 50));
