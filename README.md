# 🎮 EduPlay Offline

**15 Learning Games. One Safe App. No Internet Needed.**

A comprehensive educational mobile game app built with React Native and Expo. Fifteen games help children aged 3–12 learn math, reading, geography, logic, colors, letters, numbers, and more—all offline.

- **App version:** 1.0.3 · **Expo SDK:** 54

---

## 🌟 Features

### ✅ 100% Offline
- No internet required
- Local data with SQLite (expo-sqlite)
- Works anywhere, anytime

### 🎯 15 Educational Games
1. **👾 Math Monsters** – Addition, subtraction, multiplication
2. **📚 Story Builder** – Create stories with word choices
3. **🌍 World Explorer** – Geography and country quizzes
4. **🎨 Art Detective** – Find matching shapes and patterns
5. **🧪 Science Lab** – Simple experiments (volcano, magnet, rainbow)
6. **🍕 Chef Fractions** – Fractions with food slices
7. **🚀 Code Blocks** – Visual coding (MOVE, TURN) to reach the star
8. **🌱 Eco Guardians** – Missions (ocean, trees, animals, recycle)
9. **🎵 Music Rhythm** – Tap tiles in rhythm
10. **🧩 Logic Town** – Build structures with logic rules
11. **🍎 Fruit Finder** – Identify fruits (A/B/C or type)
12. **🌈 Color Match Parade** – Tap the target color
13. **🎈 Letter Pop Balloons** – Pop the target letter
14. **🐸 Number Hop** – Tap numbers in order (1→2→…→7)
15. **🐾 Animal Sound Match** – Match real animal sounds (moo, woof, meow, etc.)

### 👨‍👩‍👧 Parent Dashboard
- **Adjust difficulty** – Easy, Normal, or Hard (affects all games)
- **Screen time limit** – Set daily limit (minutes)
- **Game sounds** – Toggle playful ringtone in games
- **Progress** – View levels, scores, playtime per game
- **Export report** – Copy progress summary
- **Reset progress** – Clear all game data

### 🏆 Progress & Rewards
- Level progression and stars per game
- Score and playtime tracking
- Reward modals and in-game guides
- Progress saved locally

---

## 🛠️ Tech Stack

- **Framework:** React Native with **Expo SDK 54**
- **Language:** TypeScript
- **Database:** SQLite (expo-sqlite)
- **State:** Zustand
- **Navigation:** React Navigation (stack)
- **Audio:** expo-av, expo-speech; animal sounds from bundled MP3s or generated WAV tones
- **Graphics:** @shopify/react-native-skia, Lottie

---

## 📂 Project Structure

```
Educative Games/
├── App.tsx                    # Entry point
├── app.json                   # Expo config (icon: logo.png)
├── eas.json                   # EAS Build profiles (apk, aab, production)
├── package.json
├── src/
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Home + welcome setup (name, age)
│   │   ├── GameSelectScreen.tsx
│   │   └── ParentDashboard.tsx
│   ├── games/
│   │   ├── mathMonsters/
│   │   ├── storyBuilder/
│   │   ├── worldExplorer/
│   │   ├── artDetective/
│   │   ├── scienceLab/
│   │   ├── chefFractions/
│   │   ├── codeBlocks/
│   │   ├── ecoGuardians/
│   │   ├── musicRhythm/
│   │   ├── logicTown/
│   │   ├── fruitFinder/
│   │   ├── colorMatchParade/
│   │   ├── letterPopBalloons/
│   │   ├── numberHop/
│   │   └── animalSoundMatch/
│   ├── components/
│   │   ├── GameCard.tsx
│   │   ├── GameGuide.tsx
│   │   ├── ProgressBar.tsx
│   │   └── RewardModal.tsx
│   ├── database/
│   │   ├── db.ts
│   │   └── schema.ts
│   ├── store/
│   │   ├── userStore.ts
│   │   └── progressStore.ts
│   └── utils/
│       ├── sound.ts             # Music, effects, animal sounds
│       ├── math.ts              # Math questions (with difficulty)
│       ├── difficulty.ts        # Easy/Normal/Hard from settings
│       ├── wavTone.ts           # WAV tone generator (fallback)
│       ├── animalSoundAssets.ts  # Bundled animal MP3s
│       ├── tonePlayer.ts         # Tone playback
│       ├── voice.ts              # Speech/voice helpers
│       ├── audioGenerator.ts     # Audio generation
│       └── animations.ts         # Shared animation helpers
├── assets/
│   ├── logo.png               # App icon + in-app logo
│   ├── splash.png
│   ├── icon.png / adaptive-icon.png / favicon.png (optional)
│   ├── sounds/
│   │   └── animals/           # cow.mp3, dog.mp3, … (run download script)
│   └── images/
└── scripts/
    ├── create-icons.js              # Generate app icons from logo
    ├── create-placeholder-icons.js  # Placeholder icon assets
    └── download-animal-sounds.js    # Fetches real animal MP3s
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- Expo CLI / EAS CLI for builds

### Install & run

1. **Clone or open the project and install:**
   ```bash
   cd path/to/Educative-Games
   npm install
   ```

2. **Optional – real animal sounds (Animal Sound Match):**
   ```bash
   node scripts/download-animal-sounds.js
   ```
   Downloads MP3s into `assets/sounds/animals/`. If skipped, the game uses tone fallbacks.

3. **Start dev server:**
   ```bash
   npx expo start
   # or with cache clear
   npx expo start --clear
   ```

4. **Run on device or web:**
   - **Web (browser):** Press `w` in the terminal, or run `npm run start:web` / `npm run web` to open directly in the browser. All 15 games, Parent Dashboard, progress, and settings work the same as on mobile (data stored in localStorage).
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (Mac)
   - Or scan QR code with Expo Go (development build recommended for full features)

---

## 🏗️ Building for production

### Android (EAS Build)

- **APK (e.g. sideload / internal):**
  ```bash
  npm run build:apk
  # or
  eas build --platform android --profile apk
  ```

- **AAB (Google Play):**
  ```bash
  npm run build:aab
  # or
  eas build --platform android --profile aab
  ```

- **Production (store):**
  ```bash
  npm run build:android
  # or
  eas build --platform android --profile production
  ```

### iOS
```bash
npm run build:ios
# or
eas build --platform ios --profile production
```

Requires an Apple Developer account and EAS configured for iOS.

---

## 🎮 How to play

1. **First launch:** Enter child’s name and age (3–12).
2. **Home:** Tap “Play Games” to see all 15 games, or “Parent Dashboard” for settings.
3. **Difficulty:** In Parent Dashboard, set **Easy**, **Normal**, or **Hard**; all games use this (e.g. fewer/more correct needed, simpler/harder content).
4. **Game sounds:** Toggle in Parent Dashboard; when on, a playful ringtone plays in games. Animal Sound Match always plays its sounds.
5. **Progress:** Levels, scores, and playtime are saved locally and shown in Parent Dashboard; you can export a report or reset progress.

---

## 🔒 Safety & privacy

- ✅ No internet required
- ✅ No ads
- ✅ No tracking or analytics
- ✅ No chat or external links in gameplay
- ✅ Parent controls: difficulty, screen time, sounds, reset
- ✅ All data stays on device (SQLite on mobile; localStorage in browser)

---

## 📱 Supported platforms

- ✅ **Android** (phone & tablet) – APK and AAB
- ✅ **iOS** (iPhone & iPad) – via EAS
- ✅ **Web** – full access: run `npm start` then press `w`, or `npm run start:web`. Same games, Parent Dashboard, progress (localStorage); best experience on native for touch

---

## 📄 License & credits

- For educational use.
- **Developed by Russel Gallibot.**

---

**EduPlay Offline** – 15 learning games, no internet, no ads. Have fun learning.
