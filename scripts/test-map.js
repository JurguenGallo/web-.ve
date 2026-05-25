const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SVG_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Venezuela_Division_Politica_Territorial_Unicolor.svg';
const OUTPUT_PATH = path.join(__dirname, '..', 'scratch', 'venezuela_raw.svg');

function downloadSvg(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadSvg(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(dest, () => reject(new Error(`Failed: status ${response.statusCode}`)));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function run() {
  console.log('Downloading SVG from:', SVG_URL);
  try {
    await downloadSvg(SVG_URL, OUTPUT_PATH);
    console.log('SVG downloaded successfully to:', OUTPUT_PATH);
    
    const svgContent = fs.readFileSync(OUTPUT_PATH, 'utf8');
    const $ = cheerio.load(svgContent, { xmlMode: true });
    
    console.log('\n--- Path Elements Found ---');
    $('path, polygon, rect').each((i, el) => {
      const id = $(el).attr('id');
      const name = $(el).attr('name') || $(el).attr('title') || $(el).attr('class');
      if (id || name) {
        console.log(`Index: ${i}, ID: ${id || 'None'}, Name/Class: ${name || 'None'}`);
      }
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
