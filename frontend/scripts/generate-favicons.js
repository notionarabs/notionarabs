const fs = require('fs');
const path = require('path');

// This script generates all required favicon sizes
// You'll need to install sharp: npm install sharp

const sharp = require('sharp');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-57x57.png', size: 57 },
  { name: 'apple-touch-icon-60x60.png', size: 60 },
  { name: 'apple-touch-icon-72x72.png', size: 72 },
  { name: 'apple-touch-icon-76x76.png', size: 76 },
  { name: 'apple-touch-icon-114x114.png', size: 114 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },
  { name: 'apple-touch-icon-144x144.png', size: 144 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'mstile-144x144.png', size: 144 },
  { name: 'mstile-150x150.png', size: 150 }
];

async function generateFavicons() {
  const inputPath = path.join(__dirname, '../public/notionarabs.png');
  const outputDir = path.join(__dirname, '../public');

  try {
    // Read the PNG file
    const imageBuffer = fs.readFileSync(inputPath);

    console.log('Generating favicon files...');

    for (const { name, size } of sizes) {
      const outputPath = path.join(outputDir, name);

      await sharp(imageBuffer)
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png({
          quality: 100,
          compressionLevel: 9
        })
        .toFile(outputPath);

      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (16x16 and 32x32 combined)
    const favicon16 = await sharp(imageBuffer)
      .resize(16, 16, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();

    const favicon32 = await sharp(imageBuffer)
      .resize(32, 32, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();

    // For ICO file, we'll create a simple 32x32 PNG as ICO
    // (Sharp doesn't directly support ICO, but PNG works fine)
    await sharp(imageBuffer)
      .resize(32, 32, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));

    console.log('✓ Generated favicon.ico');
    console.log('\n🎉 All favicon files generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Deploy your updated site');
    console.log('2. Submit your sitemap to Google Search Console');
    console.log('3. Request re-indexing of your homepage');
    console.log('4. Wait 1-2 weeks for Google to update search results');

  } catch (error) {
    console.error('Error generating favicons:', error);
    console.log('\nTo fix this:');
    console.log('1. Install sharp: npm install sharp');
    console.log('2. Make sure your notionarabs.png file exists in public/');
    console.log('3. Run this script again: node scripts/generate-favicons.js');
  }
}

generateFavicons();
