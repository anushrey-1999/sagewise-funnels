/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const svgPath = path.join(__dirname, '../src/app/icon.svg');
  const icoPath = path.join(__dirname, '../src/app/favicon.ico');
  
  // Sizes for ICO file (common favicon sizes)
  const sizes = [16, 32, 48];
  
  try {
    // Read the SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate PNG buffers for each size
    const pngBuffers = await Promise.all(
      sizes.map(size => 
        sharp(svgBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer()
      )
    );
    
    // Convert PNGs to ICO
    const icoBuffer = await toIco(pngBuffers);
    
    // Write ICO file
    fs.writeFileSync(icoPath, icoBuffer);
    
    console.log('✅ Favicon generated successfully!');
    console.log(`   SVG: ${svgPath}`);
    console.log(`   ICO: ${icoPath}`);
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
