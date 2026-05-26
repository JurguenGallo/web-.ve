const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const galeriaFile = path.join(__dirname, '..', 'frontend', 'public', 'galeria', 'index.html');
const content = fs.readFileSync(galeriaFile, 'utf8');
const $ = cheerio.load(content);

// Let's find the parent container of n2-ss-17-align
const parent = $('#n2-ss-17-align').parent();
console.log("Parent tag name:", parent.get(0).tagName);
console.log("Parent classes:", parent.attr('class'));
console.log("Parent ID:", parent.attr('id'));

// Let's see 1000 characters of HTML around #n2-ss-17-align
const sliderHtml = $('#n2-ss-17-align').parent().html() || "";
console.log("\n--- Slider Parent Inner HTML (Truncated) ---");
console.log(sliderHtml.substring(0, 1500));
