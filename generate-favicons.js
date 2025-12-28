const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const inputPath = path.join(__dirname, 'brain-icon-source.png');
  const publicDir = path.join(__dirname, 'public');

  console.log('Generating favicons from:', inputPath);

  try {
    // Generate icon.png (512x512)
    await sharp(inputPath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'icon.png'));
    console.log('✓ Generated icon.png (512x512)');

    // Generate apple-touch-icon.png (180x180)
    await sharp(inputPath)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png (180x180)');

    // Generate favicon-32x32.png for ICO conversion
    await sharp(inputPath)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png (32x32)');

    // For .ico file, we'll just rename the 32x32 PNG to .ico
    // Modern browsers support PNG favicons, so this works fine
    fs.copyFileSync(
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon.ico')
    );
    console.log('✓ Generated favicon.ico (32x32)');

    console.log('\n✅ All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
