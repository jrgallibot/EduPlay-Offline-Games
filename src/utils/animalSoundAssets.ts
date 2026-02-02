/**
 * Bundled animal sound assets (real recordings). Used by Animal Sound Match.
 * Run `node scripts/download-animal-sounds.js` once to download the MP3s.
 */

export const animalSoundAssets: Record<string, number> = {
  cow: require('../../assets/sounds/animals/cow.mp3'),
  dog: require('../../assets/sounds/animals/dog.mp3'),
  cat: require('../../assets/sounds/animals/cat.mp3'),
  pig: require('../../assets/sounds/animals/pig.mp3'),
  chicken: require('../../assets/sounds/animals/chicken.mp3'),
  sheep: require('../../assets/sounds/animals/sheep.mp3'),
  duck: require('../../assets/sounds/animals/duck.mp3'),
  frog: require('../../assets/sounds/animals/frog.mp3'),
};
