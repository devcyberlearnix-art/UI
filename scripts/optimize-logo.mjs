import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = path.join(process.cwd(), 'public', 'assets', 'asivo-logo.png');
const outputPath = path.join(process.cwd(), 'public', 'assets', 'asivo-logo');
const assetsDir = path.join(process.cwd(), 'public', 'assets');

async function optimizeLogo() {
  console.log('Optimizing Asivo logo...');

  // Get original metadata
  const metadata = await sharp(inputPath).metadata();
  console.log('Original:', {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: (fs.statSync(inputPath).size / 1024).toFixed(2) + ' KB',
    hasAlpha: metadata.hasAlpha
  });

  // Create WebP version (best compression with transparency)
  const webpPath = `${outputPath}.webp`;
  await sharp(inputPath)
    .webp({ quality: 85, alphaQuality: 90, effort: 6 })
    .toFile(webpPath);
  const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(2);
  console.log(`WebP version: ${webpSize} KB`);

  // Create optimized PNG (smaller dimensions for display)
  // Current display is 40px height, so we'll create versions at 2x, 3x, and 4x
  const scales = [
    { name: 'asivo-logo-sm', height: 80 },   // 2x for 40px display
    { name: 'asivo-logo-md', height: 120 },  // 3x for 40px display
    { name: 'asivo-logo-lg', height: 160 }   // 4x for 40px display
  ];

  for (const scale of scales) {
    const scalePath = path.join(assetsDir, `${scale.name}.png`);
    await sharp(inputPath)
      .resize(null, scale.height, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(scalePath);
    const scaleSize = (fs.statSync(scalePath).size / 1024).toFixed(2);
    console.log(`${scale.name}.png (${scale.height}px height): ${scaleSize} KB`);
  }

  // Create original-optimized (same dimensions, better compression)
  const optimizedPath = `${outputPath}-optimized.png`;
  await sharp(inputPath)
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true })
    .toFile(optimizedPath);
  const optSize = (fs.statSync(optimizedPath).size / 1024).toFixed(2);
  console.log(`Original optimized (same dimensions): ${optSize} KB`);

  console.log('\nRecommendation:');
  console.log(`- Use asivo-logo-md.png (120px height) for main display`);
  console.log(`- Size reduction: ${((494 - parseFloat(webpSize)) / 494 * 100).toFixed(1)}% with WebP`);
  console.log(`- Size reduction: ${((494 - parseFloat(optSize)) / 494 * 100).toFixed(1)}% with optimized PNG`);
}

optimizeLogo().catch(console.error);
