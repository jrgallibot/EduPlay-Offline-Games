const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Color scheme
const primaryColor = '#4CAF50'; // Green
const secondaryColor = '#FFC107'; // Yellow
const accentColor = '#2196F3'; // Blue
const white = '#FFFFFF';
const darkGreen = '#388E3C';

// Create icon with game controller and educational elements
async function createIcon(size, outputPath) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background circle with gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkGreen};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bgGradient)"/>
      
      <!-- Game controller icon -->
      <g transform="translate(${size * 0.25}, ${size * 0.25}) scale(${size * 0.5 / 200})">
        <!-- Controller body -->
        <rect x="50" y="80" width="100" height="60" rx="10" fill="${white}" opacity="0.9"/>
        <rect x="60" y="90" width="80" height="40" rx="5" fill="${accentColor}" opacity="0.3"/>
        
        <!-- D-pad -->
        <rect x="70" y="100" width="20" height="20" rx="3" fill="${white}"/>
        <rect x="75" y="95" width="10" height="30" rx="2" fill="${white}"/>
        <rect x="70" y="105" width="30" height="10" rx="2" fill="${white}"/>
        
        <!-- Action buttons -->
        <circle cx="130" cy="110" r="8" fill="${secondaryColor}"/>
        <circle cx="145" cy="110" r="8" fill="${accentColor}"/>
        <circle cx="130" cy="125" r="8" fill="${secondaryColor}"/>
        <circle cx="145" cy="125" r="8" fill="${accentColor}"/>
        
        <!-- Shoulder buttons -->
        <rect x="55" y="70" width="30" height="15" rx="5" fill="${white}"/>
        <rect x="115" y="70" width="30" height="15" rx="5" fill="${white}"/>
      </g>
      
      <!-- Educational elements - stars -->
      <circle cx="${size * 0.2}" cy="${size * 0.2}" r="${size * 0.05}" fill="${secondaryColor}"/>
      <circle cx="${size * 0.8}" cy="${size * 0.25}" r="${size * 0.04}" fill="${accentColor}"/>
      <circle cx="${size * 0.15}" cy="${size * 0.8}" r="${size * 0.04}" fill="${accentColor}"/>
      <circle cx="${size * 0.85}" cy="${size * 0.75}" r="${size * 0.05}" fill="${secondaryColor}"/>
      
      <!-- Text "EP" for small sizes -->
      ${size <= 200 ? `
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="${white}" text-anchor="middle" dominant-baseline="middle" opacity="0.9">EP</text>
      ` : ''}
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
}

// Create splash screen
async function createSplash(width, height, outputPath) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkGreen};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="${width}" height="${height}" fill="url(#splashGradient)"/>
      
      <!-- App name centered -->
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="${width * 0.1}" font-weight="bold" fill="${white}" text-anchor="middle" dominant-baseline="middle">EduPlay</text>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${width * 0.06}" fill="${white}" text-anchor="middle" dominant-baseline="middle" opacity="0.9">Offline</text>
      
      <!-- Game controller icon -->
      <g transform="translate(${width * 0.35}, ${height * 0.65}) scale(${width * 0.3 / 200})">
        <rect x="50" y="80" width="100" height="60" rx="10" fill="${white}" opacity="0.9"/>
        <rect x="60" y="90" width="80" height="40" rx="5" fill="${accentColor}" opacity="0.3"/>
        <rect x="70" y="100" width="20" height="20" rx="3" fill="${white}"/>
        <rect x="75" y="95" width="10" height="30" rx="2" fill="${white}"/>
        <rect x="70" y="105" width="30" height="10" rx="2" fill="${white}"/>
        <circle cx="130" cy="110" r="8" fill="${secondaryColor}"/>
        <circle cx="145" cy="110" r="8" fill="${accentColor}"/>
        <circle cx="130" cy="125" r="8" fill="${secondaryColor}"/>
        <circle cx="145" cy="125" r="8" fill="${accentColor}"/>
        <rect x="55" y="70" width="30" height="15" rx="5" fill="${white}"/>
        <rect x="115" y="70" width="30" height="15" rx="5" fill="${white}"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
}

async function generateIcons() {
  console.log('🎨 Creating app icons...\n');

  try {
    // Main icon (1024x1024)
    console.log('📱 Creating icon.png (1024x1024)...');
    await createIcon(1024, path.join(assetsDir, 'icon.png'));
    console.log('✅ Created icon.png\n');

    // Adaptive icon (1024x1024) - same as main icon
    console.log('📱 Creating adaptive-icon.png (1024x1024)...');
    await createIcon(1024, path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ Created adaptive-icon.png\n');

    // Splash screen (1284x2778 for modern phones)
    console.log('🖼️  Creating splash.png (1284x2778)...');
    await createSplash(1284, 2778, path.join(assetsDir, 'splash.png'));
    console.log('✅ Created splash.png\n');

    // Favicon (48x48)
    console.log('🌐 Creating favicon.png (48x48)...');
    await createIcon(48, path.join(assetsDir, 'favicon.png'));
    console.log('✅ Created favicon.png\n');

    console.log('🎉 All icons created successfully!');
    console.log(`📁 Icons saved to: ${assetsDir}`);
    console.log('\n📋 Created files:');
    console.log('   ✓ icon.png (1024x1024)');
    console.log('   ✓ adaptive-icon.png (1024x1024)');
    console.log('   ✓ splash.png (1284x2778)');
    console.log('   ✓ favicon.png (48x48)');
    console.log('\n✨ Your app now has beautiful icons!');

  } catch (error) {
    console.error('❌ Error creating icons:', error);
    process.exit(1);
  }
}

generateIcons();

