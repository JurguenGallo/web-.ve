const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGET_DIR = path.join(__dirname, '..', 'frontend', 'public');

// Supported extensions
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Avoid traversing node_modules or .git just in case
      if (file !== 'node_modules' && file !== '.git') {
        getFilesRecursively(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function optimizeImage(filePath) {
  const statsBefore = fs.statSync(filePath);
  const sizeBefore = statsBefore.size;
  
  if (sizeBefore === 0) return { success: false, reason: 'Empty file' };

  const ext = path.extname(filePath).toLowerCase();
  const tempPath = `${filePath}.opt.tmp`;

  try {
    const buffer = fs.readFileSync(filePath);
    let pipeline = sharp(buffer);

    // Apply optimization based on extension
    if (ext === '.png') {
      pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
    } else if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: 80 });
    }

    await pipeline.toFile(tempPath);

    const statsAfter = fs.statSync(tempPath);
    const sizeAfter = statsAfter.size;

    // Only replace if the optimized image is actually smaller
    if (sizeAfter < sizeBefore) {
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      const saved = sizeBefore - sizeAfter;
      return {
        success: true,
        sizeBefore,
        sizeAfter,
        saved,
        percent: ((saved / sizeBefore) * 100).toFixed(1)
      };
    } else {
      // Clean up temp file, keep original since it was smaller/optimized already
      fs.unlinkSync(tempPath);
      return { success: false, reason: 'Already optimized (temp file was larger)' };
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    return { success: false, error: err.message };
  }
}

async function run() {
  console.log(`Scanning directory: ${TARGET_DIR} for images...`);
  const imageFiles = getFilesRecursively(TARGET_DIR);
  console.log(`Found ${imageFiles.length} image(s) to analyze.\n`);

  let totalSaved = 0;
  let optimizedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const relativePath = path.relative(TARGET_DIR, file);
    
    console.log(`[${i + 1}/${imageFiles.length}] Processing: ${relativePath}...`);
    const result = await optimizeImage(file);
    
    if (result.success) {
      const beforeKB = (result.sizeBefore / 1024).toFixed(1);
      const afterKB = (result.sizeAfter / 1024).toFixed(1);
      const savedKB = (result.saved / 1024).toFixed(1);
      console.log(`  ✓ Optimized: ${beforeKB}KB -> ${afterKB}KB (Saved ${savedKB}KB, -${result.percent}%)`);
      totalSaved += result.saved;
      optimizedCount++;
    } else if (result.reason) {
      console.log(`  - Skipped: ${result.reason}`);
      skippedCount++;
    } else {
      console.error(`  ✗ Error: ${result.error}`);
      failedCount++;
    }
  }

  const totalSavedMB = (totalSaved / (1024 * 1024)).toFixed(2);
  console.log(`\n========================================`);
  console.log(`Optimization Complete!`);
  console.log(`- Images optimized: ${optimizedCount}`);
  console.log(`- Images skipped: ${skippedCount}`);
  console.log(`- Images failed: ${failedCount}`);
  console.log(`- Total space saved: ${totalSavedMB} MB`);
  console.log(`========================================`);
}

run();
