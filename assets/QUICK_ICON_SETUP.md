# Creating App Icons - Quick Start

**Current setup:** The app uses `assets/logo.png` for:
- **App icon** (home screen / APK icon)
- **Android adaptive icon** (foreground)
- **Web favicon**
- **In-app logo** (Home screen and Welcome setup)

Replace or update `assets/logo.png` to change the branding everywhere. For best results on Android, use a square PNG (e.g. 1024×1024) with transparency; the adaptive icon will use the green background from `app.json`.

---

## Option 1: Use Online Generator (Easiest)

1. Go to: https://www.appicon.co/
2. Upload a 1024x1024 image
3. Download all sizes
4. Place in `assets/` folder

## Option 2: Create Simple Placeholder Icons

### Using Python (if you have it):
```python
from PIL import Image, ImageDraw, ImageFont

# Create 1024x1024 icon
icon = Image.new('RGB', (1024, 1024), '#4CAF50')
draw = ImageDraw.Draw(icon)
# Add text or emoji
# Save as icon.png
```

### Using Node.js Script:
Create `create-icons.js`:
```javascript
const fs = require('fs');
// Use canvas or sharp library to create icons
```

## Option 3: Use Design Tool

1. **Figma:**
   - Create 1024x1024 frame
   - Design icon
   - Export as PNG

2. **Canva:**
   - Create custom size 1024x1024
   - Design icon
   - Download as PNG

## Temporary Solution

For now, you can use emoji-based icons:
1. Create 1024x1024 image with emoji 🎮
2. Green background (#4CAF50)
3. Save as both `icon.png` and `adaptive-icon.png`

## Required Files

Place these in `assets/` folder:
- `icon.png` - 1024x1024
- `adaptive-icon.png` - 1024x1024  
- `splash.png` - 1284x2778
- `favicon.png` - 48x48

Once icons are created, the app is ready to build as .aab!

