import { writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const IMAGES_DIR = join(PROJECT_ROOT, 'client', 'public', 'images', 'products');

const MAX_WIDTH = 1600;
const THUMB_WIDTH = 600;
const QUALITY = 78;

const SKIP_DIRS = ['_originals', '_incoming'];

async function optimizeImage(inputPath, relPath) {
  const ext = extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return null;
  }

  const originalStats = statSync(inputPath);
  const originalSize = originalStats.size;

  // Skip if already optimized (has both webp and thumbnail)
  const baseName = basename(inputPath, ext);
  const dir = join(IMAGES_DIR, relPath.replace(basename(relPath), ''));
  const webpPath = join(dir, `${baseName}.webp`);
  const thumbPath = join(dir, `${baseName}-thumb.webp`);

  if (existsSync(webpPath) && existsSync(thumbPath)) {
    const webpStats = statSync(webpPath);
    const thumbStats = statSync(thumbPath);
    return {
      original: inputPath,
      webp: webpPath,
      thumbnail: thumbPath,
      originalSize,
      webpSize: webpStats.size,
      thumbnailSize: thumbStats.size,
    };
  }

  try {
    const image = sharp(inputPath);
    await image.metadata();

    // Create main WebP (max 1600px wide)
    await image
      .clone()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(webpPath);

    // Create thumbnail WebP (600px wide)
    await image
      .clone()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(thumbPath);

    const webpStats = statSync(webpPath);
    const thumbStats = statSync(thumbPath);

    console.log(`✅ ${relPath} → ${(webpStats.size / 1024).toFixed(1)} KB (main) + ${(thumbStats.size / 1024).toFixed(1)} KB (thumb)`);
    return {
      original: inputPath,
      webp: webpPath,
      thumbnail: thumbPath,
      originalSize,
      webpSize: webpStats.size,
      thumbnailSize: thumbStats.size,
    };
  } catch (error) {
    console.error(`❌ Failed to optimize ${relPath}:`, error);
    return null;
  }
}

function walkDir(dir, results = [], prefix = '') {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) {
        walkDir(fullPath, results, relPath);
      }
    } else {
      results.push(relPath);
    }
  }
  return results;
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');

  const files = walkDir(IMAGES_DIR);
  const imageFiles = files.filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase()));

  console.log(`Found ${imageFiles.length} images to process.\n`);

  const results = [];
  let totalOriginal = 0;
  let totalWebp = 0;
  let totalThumb = 0;

  for (const relPath of imageFiles) {
    const fullPath = join(IMAGES_DIR, relPath);
    const result = await optimizeImage(fullPath, relPath);
    if (result) {
      results.push(result);
      totalOriginal += result.originalSize;
      totalWebp += result.webpSize;
      totalThumb += result.thumbnailSize;
    }
  }

  console.log('\n📊 Optimization Summary:');
  console.log(`  Images processed: ${results.length}`);
  console.log(`  Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  WebP total: ${(totalWebp / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Thumbnail total: ${(totalThumb / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Combined WebP total: ${((totalWebp + totalThumb) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Savings: ${((1 - (totalWebp + totalThumb) / totalOriginal) * 100).toFixed(1)}%`);

  // Check for oversized images
  const oversized = results.filter(r => r.webpSize > 400 * 1024);
  if (oversized.length > 0) {
    console.log('\n⚠️  Images over 400 KB (main WebP):');
    for (const r of oversized) {
      console.log(`  - ${basename(r.webp)}: ${(r.webpSize / 1024).toFixed(1)} KB`);
    }
  }

  // Write manifest for reference
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalImages: results.length,
    totalOriginalBytes: totalOriginal,
    totalWebpBytes: totalWebp,
    totalThumbnailBytes: totalThumb,
    images: results.map(r => ({
      original: r.original.replace(PROJECT_ROOT, ''),
      webp: r.webp.replace(PROJECT_ROOT, ''),
      thumbnail: r.thumbnail.replace(PROJECT_ROOT, ''),
      originalSizeKB: Math.round(r.originalSize / 1024),
      webpSizeKB: Math.round(r.webpSize / 1024),
      thumbnailSizeKB: Math.round(r.thumbnailSize / 1024),
    })),
  };

  writeFileSync(
    join(PROJECT_ROOT, 'client', 'public', 'images', 'optimization-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('\n✅ Optimization complete! Manifest written to public/images/optimization-manifest.json');
}

main().catch(console.error);