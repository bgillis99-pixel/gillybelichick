/**
 * Icon Generator for Mobile Carb Check
 *
 * Simple HTML Canvas-based icon generation
 * Run with: node scripts/generate-icons.js
 *
 * Note: For production, consider using sharp or jimp for better quality
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Mobile Carb Check - Icon Generator');
console.log('=====================================\n');

console.log('To generate icons, please:');
console.log('1. Open generate-icons.html in your browser');
console.log('2. Click the generate buttons');
console.log('3. Right-click and save each canvas as PNG\n');

console.log('Alternative: Use an online SVG to PNG converter');
console.log('- Upload public/icon.svg');
console.log('- Export as 192x192 and 512x512\n');

console.log('Quick option: Use ImageMagick if installed:');
console.log('  convert public/icon.svg -resize 192x192 public/icon-192.png');
console.log('  convert public/icon.svg -resize 512x512 public/icon-512.png\n');

// Check if ImageMagick is available
const { execSync } = require('child_process');
try {
    execSync('which convert', { stdio: 'ignore' });
    console.log('✓ ImageMagick detected! Attempting conversion...\n');

    const publicDir = path.join(__dirname, '..', 'public');
    const svgPath = path.join(publicDir, 'icon.svg');

    if (fs.existsSync(svgPath)) {
        try {
            execSync(`convert "${svgPath}" -resize 192x192 "${path.join(publicDir, 'icon-192.png')}"`, { stdio: 'inherit' });
            execSync(`convert "${svgPath}" -resize 512x512 "${path.join(publicDir, 'icon-512.png')}"`, { stdio: 'inherit' });
            console.log('✅ Icons generated successfully!');
        } catch (err) {
            console.log('❌ Conversion failed. Please use the HTML generator instead.');
        }
    }
} catch (err) {
    console.log('ℹ️  ImageMagick not found. Use the HTML generator or install ImageMagick.');
}
