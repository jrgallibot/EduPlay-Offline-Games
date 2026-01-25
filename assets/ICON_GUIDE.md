# App Icon Creation Guide

## Icon Requirements

### Main Icon (icon.png)
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Design:** Should represent "EduPlay Offline" - educational games for kids
- **Colors:** Use bright, child-friendly colors (green #4CAF50 as primary)

### Android Adaptive Icon (adaptive-icon.png)
- **Size:** 1024x1024 pixels  
- **Format:** PNG with transparency
- **Safe Zone:** Keep important content within 512x512 center area
- **Background:** Will use #4CAF50 from app.json

### Splash Screen (splash.png)
- **Size:** 1284x2778 pixels (or 1242x2436 for iPhone X)
- **Format:** PNG
- **Background:** #4CAF50 (green)
- **Content:** App logo/name centered

### Favicon (favicon.png)
- **Size:** 48x48 pixels
- **Format:** PNG
- **Use:** Web version

## Quick Icon Creation

You can create icons using:
1. **Online Tools:**
   - https://www.favicon-generator.org/
   - https://www.appicon.co/
   - https://icon.kitchen/

2. **Design Software:**
   - Figma
   - Adobe Illustrator
   - Canva

3. **AI Generators:**
   - DALL-E
   - Midjourney
   - Stable Diffusion

## Icon Design Suggestions

**Concept:** Educational games for kids
**Elements to include:**
- 🎮 Game controller or puzzle piece
- 📚 Book or learning symbol
- 🌟 Star or trophy
- 🎨 Colorful, playful design
- 👶 Child-friendly imagery

**Color Palette:**
- Primary: #4CAF50 (Green)
- Secondary: #FFC107 (Yellow/Orange)
- Accent: #2196F3 (Blue)
- Background: #FFFFFF (White)

## Placeholder Icons

For now, you can use simple placeholder icons:
1. Create a 1024x1024 PNG with text "EP" (EduPlay)
2. Use bright green background (#4CAF50)
3. White or yellow text/emoji
4. Save as `icon.png` and `adaptive-icon.png`

## After Creating Icons

1. Place all icon files in `assets/` folder:
   - `icon.png` (1024x1024)
   - `adaptive-icon.png` (1024x1024)
   - `splash.png` (1284x2778)
   - `favicon.png` (48x48)

2. Run: `npx expo prebuild` to generate native folders

3. Build: `npm run build:android:aab` for Android App Bundle

