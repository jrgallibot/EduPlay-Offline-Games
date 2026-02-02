import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { getNoteFrequency } from './tonePlayer';
import { getWavBase64 } from './wavTone';
import { animalSoundAssets } from './animalSoundAssets';
import { getSetting, setSetting } from '../database/db';

// Audio objects for background music and sound effects
let backgroundMusic: Audio.Sound | null = null;
let winSound: Audio.Sound | null = null;
let loseSound: Audio.Sound | null = null;
let isMusicEnabled = true;
let musicPlaying = false;

// Load sound setting from storage (call after DB init)
export const loadSoundSetting = () => {
  try {
    const saved = getSetting('sound_enabled');
    isMusicEnabled = saved !== '0';
  } catch {
    isMusicEnabled = true;
  }
};

// Check if sound is enabled (for games to respect settings)
export const getSoundEnabled = (): boolean => isMusicEnabled;

// Initialize audio mode so game sounds play (iOS silent mode, Android duck others)
export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      allowsRecordingIOS: false,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.log('Audio initialization error:', error);
  }
};

// Play a musical note: audible tone via speech (vowel at pitch) + haptic. Set forcePlay true to play even when sound is off (e.g. animal sounds).
const playNote = async (note: string, octave: number, duration: number = 200, syllable: string = 'e', forcePlay?: boolean) => {
  if (!forcePlay && !isMusicEnabled) return;
  try {
    const frequency = getNoteFrequency(note, octave);
    const pitch = Math.max(0.6, Math.min(2.0, 1.0 + (frequency - 440) / 2200));

    const stopAt = Math.min(duration, 220);
    try {
      await Speech.speak(syllable, {
        pitch,
        rate: syllable === 'la' ? 1.4 : 2.2,
        volume: 1.0,
        language: 'en',
      });
      setTimeout(async () => {
        try {
          await Speech.stop();
        } catch (e) {}
      }, stopAt);
    } catch (speechError) {
      // fallback: haptic only
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  } catch (error) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  }
};

// Generate a simple tone frequency (for creating melodies)
const generateToneFrequency = (note: number, octave: number = 4): number => {
  // A4 = 440Hz, calculate other notes
  const A4 = 440;
  const semitones = note - 9; // A is note 9
  return A4 * Math.pow(2, (semitones + (octave - 4) * 12) / 12);
};

// Create a simple melody using expo-av (programmatic music)
const createMelody = async (frequencies: number[], duration: number = 200): Promise<Audio.Sound> => {
  // For now, we'll use a simple approach with expo-av
  // In a full implementation, you'd generate actual audio buffers
  // This is a placeholder that will work with haptics
  
  // Create a simple sound using expo-av's capabilities
  // Note: Full audio generation requires Web Audio API which isn't directly available in RN
  // So we'll use haptics as the primary feedback and prepare for audio files
  
  return null as any; // Placeholder
};

// EduPlay ringtone – playful melody when Game Sounds is ON (recognizable tune, "la" singing)
let musicInterval: NodeJS.Timeout | null = null;
let lastFailureTime = 0;
const FAILURE_MUSIC_COOLDOWN = 3000;

export const startBackgroundMusic = async () => {
  try {
    if (!isMusicEnabled || musicPlaying) return;
    
    await stopBackgroundMusic();
    await initializeAudio();
    musicPlaying = true;

    // Playful ringtone: "Twinkle Twinkle" first phrase – clear, recognizable tune when sounds ON
    const ringtoneMelody = [
      { note: 'C', octave: 4, duration: 380 },
      { note: 'C', octave: 4, duration: 380 },
      { note: 'G', octave: 4, duration: 380 },
      { note: 'G', octave: 4, duration: 380 },
      { note: 'A', octave: 4, duration: 380 },
      { note: 'A', octave: 4, duration: 380 },
      { note: 'G', octave: 4, duration: 420 },
      { note: 'F', octave: 4, duration: 380 },
      { note: 'F', octave: 4, duration: 380 },
      { note: 'E', octave: 4, duration: 380 },
      { note: 'E', octave: 4, duration: 380 },
      { note: 'D', octave: 4, duration: 380 },
      { note: 'D', octave: 4, duration: 380 },
      { note: 'C', octave: 4, duration: 500 },
    ];

    const PAUSE_BETWEEN_LOOPS = 1200;

    const playMusicLoop = async () => {
      if (!isMusicEnabled || !musicPlaying) return;
      
      try {
        for (const n of ringtoneMelody) {
          if (!isMusicEnabled || !musicPlaying) break;
          await playNote(n.note, n.octave, n.duration, 'la');
          await new Promise(resolve => setTimeout(resolve, 60));
        }
        
        if (isMusicEnabled && musicPlaying) {
          setTimeout(() => playMusicLoop(), PAUSE_BETWEEN_LOOPS);
        }
      } catch (error) {
        if (isMusicEnabled && musicPlaying) {
          setTimeout(() => playMusicLoop(), 1000);
        }
      }
    };

    playMusicLoop();
    
  } catch (error) {
    console.log('Error starting background music:', error);
    musicPlaying = false;
  }
};

export const stopBackgroundMusic = async () => {
  try {
    musicPlaying = false;
    
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
    
    await Speech.stop();
    
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
      await backgroundMusic.unloadAsync();
      backgroundMusic = null;
    }
  } catch (error) {
    console.log('Error stopping background music:', error);
  }
};

// Victory music - playful, celebratory (EduPlay style)
export const playWinMusic = async () => {
  try {
    await stopBackgroundMusic();
    if (winSound) {
      await winSound.unloadAsync();
    }
    if (!isMusicEnabled) return;
    const victoryNotes = [
      { note: 'C', octave: 5, duration: 220 },
      { note: 'E', octave: 5, duration: 220 },
      { note: 'G', octave: 5, duration: 220 },
      { note: 'C', octave: 6, duration: 500 },
      { note: 'G', octave: 5, duration: 180 },
      { note: 'C', octave: 6, duration: 450 },
    ];
    for (const note of victoryNotes) {
      await playNote(note.note, note.octave, note.duration);
      await new Promise(resolve => setTimeout(resolve, 45));
    }
    setTimeout(() => startBackgroundMusic(), 2200);
  } catch (error) {
    console.log('Error playing win music:', error);
  }
};

// Failure music - gentle, encouraging (with cooldown)
export const playLoseMusic = async () => {
  try {
    const now = Date.now();
    if (now - lastFailureTime < FAILURE_MUSIC_COOLDOWN) return;
    lastFailureTime = now;
    await stopBackgroundMusic();
    if (loseSound) await loseSound.unloadAsync();
    if (!isMusicEnabled) return;
    const failureNotes = [
      { note: 'C', octave: 4, duration: 250 },
      { note: 'A', octave: 3, duration: 250 },
      { note: 'F', octave: 3, duration: 400 },
    ];
    for (const note of failureNotes) {
      await playNote(note.note, note.octave, note.duration);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    setTimeout(() => startBackgroundMusic(), 1500);
  } catch (error) {
    console.log('Error playing lose music:', error);
  }
};

// Animal sounds = pure sine-wave tone patterns (no Speech, no human/AI voice). Each animal has a distinct pitch pattern.
const ANIMAL_TONES: Record<string, { note: string; octave: number; duration: number }[]> = {
  cow: [
    { note: 'G', octave: 2, duration: 450 },
    { note: 'C', octave: 2, duration: 500 },
  ],
  dog: [
    { note: 'C', octave: 3, duration: 120 },
    { note: 'C', octave: 3, duration: 140 },
  ],
  cat: [
    { note: 'E', octave: 4, duration: 160 },
    { note: 'G', octave: 4, duration: 160 },
    { note: 'A', octave: 4, duration: 280 },
  ],
  pig: [
    { note: 'G', octave: 2, duration: 220 },
    { note: 'C', octave: 3, duration: 200 },
  ],
  chicken: [
    { note: 'A', octave: 4, duration: 100 },
    { note: 'G', octave: 4, duration: 100 },
  ],
  sheep: [
    { note: 'E', octave: 3, duration: 500 },
  ],
  duck: [
    { note: 'A', octave: 5, duration: 120 },
    { note: 'A', octave: 5, duration: 120 },
  ],
  frog: [
    { note: 'C', octave: 3, duration: 140 },
    { note: 'G', octave: 4, duration: 120 },
    { note: 'C', octave: 3, duration: 160 },
  ],
};

/** Play real animal recording if available, otherwise pure-tone fallback. Always plays so the game is playable. */
export const playAnimalSound = async (animalKey: string) => {
  const key = animalKey.toLowerCase();
  await Speech.stop();

  const asset = animalSoundAssets[key];
  if (asset != null) {
    try {
      const { sound } = await Audio.Sound.createAsync(asset);
      await sound.playAsync();
      await new Promise((r) => setTimeout(r, 2500));
      await sound.unloadAsync();
      return;
    } catch (e) {
      // fall through to tone fallback
    }
  }

  const sequence = ANIMAL_TONES[key];
  if (!sequence || !FileSystem.cacheDirectory) return;
  try {
    for (let i = 0; i < sequence.length; i++) {
      const { note, octave, duration } = sequence[i];
      const frequency = getNoteFrequency(note, octave);
      const base64 = getWavBase64(frequency, duration, 0.3);
      const uri = `${FileSystem.cacheDirectory}animal_tone_${Date.now()}_${i}.wav`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      await new Promise((r) => setTimeout(r, duration + 80));
      await sound.unloadAsync();
      if (i < sequence.length - 1) {
        await new Promise((r) => setTimeout(r, 80));
      }
    }
  } catch (e) {
    // ignore
  }
};

// Sound effects: real game tones (when sound on) + haptic
export const playSoundEffect = async (type: 'correct' | 'wrong' | 'win' | 'click') => {
  if (!isMusicEnabled) return;
  try {
    switch (type) {
      case 'correct':
        await playNote('E', 5, 120);
        await playNote('G', 5, 120);
        break;
      case 'wrong':
        await playNote('C', 3, 180);
        break;
      case 'win':
        await playNote('C', 6, 220);
        break;
      case 'click':
        await playNote('C', 5, 80);
        break;
      default:
        await playNote('C', 4, 80);
    }
  } catch (error) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
  }
};

// Toggle sound on/off (saved to DB, used for music + effects)
export const setMusicEnabled = (enabled: boolean) => {
  isMusicEnabled = enabled;
  setSetting('sound_enabled', enabled ? '1' : '0');
  if (!enabled) {
    stopBackgroundMusic();
  } else {
    startBackgroundMusic();
  }
};

// Cleanup all audio
export const cleanupAudio = async () => {
  await stopBackgroundMusic();
  if (winSound) {
    await winSound.unloadAsync();
    winSound = null;
  }
  if (loseSound) {
    await loseSound.unloadAsync();
    loseSound = null;
  }
};

// Legacy functions for audio files
let soundObjects: { [key: string]: any } = {};

export const loadSound = async (key: string, source: any) => {
  try {
    const { sound } = await Audio.Sound.createAsync(source);
    soundObjects[key] = sound;
  } catch (error) {
    console.error(`Error loading sound ${key}:`, error);
  }
};

export const playSound = async (key: string) => {
  try {
    const sound = soundObjects[key];
    if (sound) {
      await sound.replayAsync();
    }
  } catch (error) {
    console.error(`Error playing sound ${key}:`, error);
  }
};

export const stopSound = async (key: string) => {
  try {
    const sound = soundObjects[key];
    if (sound) {
      await sound.stopAsync();
    }
  } catch (error) {
    console.error(`Error stopping sound ${key}:`, error);
  }
};

export const unloadAllSounds = async () => {
  try {
    for (const key in soundObjects) {
      await soundObjects[key].unloadAsync();
    }
    soundObjects = {};
  } catch (error) {
    console.error('Error unloading sounds:', error);
  }
};

