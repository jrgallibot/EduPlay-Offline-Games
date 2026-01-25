# 🎮 EduPlay Offline

**11 Learning Games. One Safe App. No Internet Needed.**

A comprehensive educational mobile game application built with React Native and Expo, featuring 11 engaging games designed to help children aged 5-10 learn math, reading, geography, logic, and more—all completely offline!

---

## 🌟 Features

### ✅ **100% Offline**
- No internet connection required
- All data stored locally with SQLite
- Works anywhere, anytime

### 🎯 **11 Educational Games**
1. **👾 Math Monsters Arena** - Battle monsters by solving math problems
2. **📚 Story Builder Kids** - Create stories by learning grammar
3. **🌍 World Explorer** - Learn geography through interactive maps
4. **🎨 Art Detective** - Identify shapes, colors, and patterns
5. **🧪 Science Tap Lab** - Discover cause and effect through experiments
6. **🍕 Chef Fractions** - Master fractions by slicing food
7. **🚀 Code Blocks Junior** - Learn coding logic with visual blocks
8. **🌱 Eco Guardians** - Environmental responsibility missions
9. **🎵 Music Rhythm Tiles** - Develop rhythm and timing skills
10. **🧩 Logic Town Builder** - Build cities using logic and planning
11. **🍎 Fruit Finder** - Learn fruit names through fun identification

### 👨‍👩‍👧 **Parent Dashboard**
- Track progress across all games
- View playtime and scores
- Monitor skill development
- Safe, ad-free environment

### 🏆 **Progress Tracking**
- Level progression system
- Star-based achievements
- Score tracking
- Rewards and motivational feedback

---

## 🛠️ Tech Stack

- **Framework:** React Native with Expo SDK 52
- **Language:** TypeScript
- **Database:** SQLite (expo-sqlite ~15.0.0)
- **State Management:** Zustand
- **Navigation:** React Navigation
- **Game Engine:** react-native-game-engine
- **Animations:** react-native-reanimated (~3.16.0)
- **Gestures:** react-native-gesture-handler (~2.20.0)
- **Graphics:** @shopify/react-native-skia
- **Audio:** expo-av (~15.0.0)

---

## 📂 Project Structure

```
eduplay-offline/
├── App.tsx                 # Entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── src/
    ├── navigation/
    │   └── RootNavigator.tsx       # Navigation setup
    ├── screens/
    │   ├── HomeScreen.tsx          # Welcome screen
    │   ├── GameSelectScreen.tsx    # Game selection hub
    │   └── ParentDashboard.tsx     # Parent monitoring
    ├── games/
    │   ├── mathMonsters/           # Math game
    │   ├── storyBuilder/           # Story creation game
    │   ├── worldExplorer/          # Geography game
    │   ├── artDetective/           # Pattern recognition
    │   ├── scienceLab/             # Science experiments
    │   ├── chefFractions/          # Fractions game
    │   ├── codeBlocks/             # Coding logic
    │   ├── ecoGuardians/           # Environment game
    │   ├── musicRhythm/            # Music timing
    │   ├── logicTown/              # Logic building
    │   └── fruitFinder/           # Fruit identification
    ├── components/
    │   ├── GameCard.tsx            # Reusable game card
    │   ├── ProgressBar.tsx         # Progress indicator
    │   └── RewardModal.tsx         # Achievement popup
    ├── database/
    │   ├── db.ts                   # SQLite operations
    │   └── schema.ts               # Database schema
    ├── store/
    │   ├── userStore.ts            # User state
    │   └── progressStore.ts        # Progress state
    └── utils/
        ├── sound.ts                # Audio utilities
        ├── animations.ts           # Animation helpers
        └── math.ts                 # Math utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli` or `npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- **Expo SDK 52** (already configured)

### Installation

1. **Navigate to project directory:**
   ```bash
   cd "C:\Users\ffgallibot\Desktop\Systems\Educative Games"
   ```

2. **Install dependencies (SDK 52 compatible):**
   ```bash
   npm install
   # or use expo install for guaranteed compatibility
   npx expo install --fix
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   # or
   npm start
   ```

4. **Run on device/emulator:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with **Expo Go** app for physical device

**Note:** See `EXPO_SDK52_SETUP.md` for detailed SDK 52 setup instructions.

---

## 🎮 How to Play

1. **First Time Setup:**
   - Enter child's name and age
   - App creates a personalized profile

2. **Choose a Game:**
   - Browse 11 different games on the selection screen
   - Each game shows current level and stars earned

3. **Play and Learn:**
   - Complete challenges to earn points
   - Progress through levels
   - Unlock achievements and rewards

4. **Parent Monitoring:**
   - Access Parent Dashboard from home screen
   - View detailed progress reports
   - Track playtime and learning metrics

---

## 🎯 Game Details

### 👾 Math Monsters Arena
- **Age:** 6-10
- **Skills:** Addition, subtraction, multiplication, division
- **Gameplay:** Battle monsters by solving math problems quickly
- **Progression:** Difficulty increases with each level

### 📚 Story Builder Kids
- **Age:** 5-9
- **Skills:** Grammar, sentence structure, creativity
- **Gameplay:** Drag and drop words to create grammatically correct stories
- **Progression:** More complex sentence structures unlock

### 🌍 World Explorer
- **Age:** 6-10
- **Skills:** Geography, cultures, capitals
- **Gameplay:** Explore interactive world map, complete country quizzes
- **Progression:** Collect stamps from each country visited

### 🎨 Art Detective
- **Age:** 5-8
- **Skills:** Pattern recognition, visual discrimination
- **Gameplay:** Find matching shapes and colors
- **Progression:** More shapes and complex patterns

### 🧪 Science Tap Lab
- **Age:** 7-10
- **Skills:** Scientific thinking, cause and effect
- **Gameplay:** Mix ingredients to create reactions
- **Progression:** More complex experiments unlock

### 🍕 Chef Fractions
- **Age:** 6-10
- **Skills:** Fractions, measurements
- **Gameplay:** Select correct fraction of food items
- **Progression:** More complex fractions and denominators

### 🚀 Code Blocks Junior
- **Age:** 7-10
- **Skills:** Coding logic, sequencing
- **Gameplay:** Use visual blocks (MOVE, TURN, LOOP) to guide robot
- **Progression:** More complex puzzles and blocks

### 🌱 Eco Guardians
- **Age:** 5-10
- **Skills:** Environmental awareness, responsibility
- **Gameplay:** Complete missions like cleaning oceans, planting trees
- **Progression:** More missions and bigger impact

### 🎵 Music Rhythm Tiles
- **Age:** 5-8
- **Skills:** Rhythm, timing, coordination
- **Gameplay:** Tap tiles in rhythm as they light up
- **Progression:** Faster tempo and more tiles

### 🧩 Logic Town Builder
- **Age:** 6-10
- **Skills:** Logic, planning, spatial reasoning
- **Gameplay:** Build stable structures using logic rules
- **Progression:** Larger grids and more buildings

### 🍎 Fruit Finder
- **Age:** 5-8
- **Skills:** Vocabulary, word recognition, spelling
- **Gameplay:** Identify fruits by typing their names
- **Progression:** More fruits and harder names

---

## 🔒 Safety & Privacy

- ✅ **No Internet Required** - 100% offline functionality
- ✅ **No Ads** - Completely ad-free experience
- ✅ **No Tracking** - Zero data collection or tracking
- ✅ **No Chat** - No communication with strangers
- ✅ **COPPA Compliant** - Designed with child privacy in mind
- ✅ **Parent Controls** - Dashboard for monitoring and limits

---

## 🏗️ Building for Production

### Android APK
```bash
expo build:android
```

### iOS App
```bash
expo build:ios
```

### Using EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

---

## 🧪 Testing

All games include:
- Progress saving/loading
- Score tracking
- Level progression
- Achievement system
- Error handling

Test each game by:
1. Playing through multiple levels
2. Checking progress persistence
3. Verifying parent dashboard updates
4. Testing offline functionality

---

## 📱 Supported Platforms

- ✅ iOS (iPhone & iPad)
- ✅ Android (Phone & Tablet)
- ⚠️ Web (limited game engine support)

---

## 🤝 Contributing

This is an educational project. Suggestions for improvements:
- Additional game types
- More levels for existing games
- Accessibility features
- Multiple language support
- Sound effects and music

---

## 📄 License

This project is created for educational purposes.

---

## 🙏 Acknowledgments

- Built with React Native and Expo
- Game concepts designed for early childhood education
- Inspired by evidence-based learning methodologies
- No internet required - perfect for limited connectivity areas

---

## 📧 Support

For issues or questions:
1. Check that all dependencies are installed
2. Verify Node.js and Expo versions
3. Test on different devices/simulators
4. Review console logs for errors

---

## 🎉 Have Fun Learning!

**EduPlay Offline** makes learning fun, safe, and accessible for all children. No internet, no ads, no worries—just pure educational entertainment!

---

**Built with ❤️ for young learners everywhere**

