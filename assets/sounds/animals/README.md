# Animal sound files for Animal Sound Match game

This folder should contain one MP3 per animal, named exactly:

- `cow.mp3`
- `dog.mp3`
- `cat.mp3`
- `pig.mp3`
- `chicken.mp3`
- `sheep.mp3`
- `duck.mp3`
- `frog.mp3`

## Quick setup (recommended)

From the project root, run:

```bash
node scripts/download-animal-sounds.js
```

This downloads royalty-free recordings from [FreeAnimalSounds.org](https://freeanimalsounds.org/) into this folder. The app will then use real animal sounds (moo, woof, meow, etc.) in the Animal Sound Match game.

## Manual setup

If you prefer to add your own files, download royalty-free animal sounds and save them here with the names above. Sources:

- [FreeAnimalSounds.org – Farm animals](https://freeanimalsounds.org/farm-animals/)
- [FreeAnimalSounds.org – Forest (frog)](https://freeanimalsounds.org/forest-sounds/)
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/search/animals/)

If any file is missing, the game falls back to simple beep patterns so it still works.
