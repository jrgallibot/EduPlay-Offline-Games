const fs = require('fs');
const path = require('path');

// Simple SVG-based icon generator
// This creates a basic icon that can be converted to PNG

const createIconSVG = (size, text = 'EP') => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4CAF50"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
};

const assetsDir = path.join(__dirname, 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder SVG icons (you'll need to convert these to PNG)
const iconSVG = createIconSVG(1024, '🎮');
const adaptiveIconSVG = createIconSVG(1024, '🎮');
const splashSVG = createIconSVG(1284, 'EduPlay\nOffline');
const faviconSVG = createIconSVG(48, 'EP');

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSVG);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.svg'), adaptiveIconSVG);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSVG);
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), faviconSVG);

console.log('✅ Created SVG placeholder icons in assets/ folder');
console.log('📝 Note: You need to convert these SVG files to PNG format');
console.log('💡 Use an online converter or design tool to create PNG versions');
console.log('📋 Required PNG files:');
console.log('   - icon.png (1024x1024)');
console.log('   - adaptive-icon.png (1024x1024)');
console.log('   - splash.png (1284x2778)');
console.log('   - favicon.png (48x48)');

