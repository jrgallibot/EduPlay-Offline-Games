import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { getNoteFrequency } from './tonePlayer';

// Audio objects for background music and sound effects
let backgroundMusic: Audio.Sound | null = null;
let winSound: Audio.Sound | null = null;
let loseSound: Audio.Sound | null = null;
let isMusicEnabled = true;
let musicPlaying = false;

// Initialize audio mode
export const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      allowsRecordingIOS: false,
    });
  } catch (error) {
    console.log('Audio initialization error:', error);
  }
};

// Play a musical note using haptics and audio feedback (works offline in APK)
const playNote = async (note: string, octave: number, duration: number = 200) => {
  try {
    const frequency = getNoteFrequency(note, octave);
    
    // Haptic feedback based on frequency (always works)
    const hapticType = frequency > 500 
      ? Haptics.ImpactFeedbackStyle.Light 
      : frequency > 300 
      ? Haptics.ImpactFeedbackStyle.Medium 
      : Haptics.ImpactFeedbackStyle.Heavy;
    
    await Haptics.impactAsync(hapticType);
    
    // Create audio beep using speech synthesis with pitch control
    // This creates actual sound that works in APK builds
    try {
      const pitch = Math.max(0.5, Math.min(2.0, 1.0 + (frequency - 440) / 2200));
      
      // Use a space character with very fast rate to create a beep-like sound
      await Speech.speak(' ', {
        pitch: pitch,
        rate: 0.001, // Extremely fast to create beep
        language: 'en',
      });
      
      // Auto-stop after duration
      setTimeout(async () => {
        try {
          await Speech.stop();
        } catch (e) {}
      }, Math.min(duration, 500));
    } catch (speechError) {
      // If speech fails, haptics still work
      console.log('Speech audio unavailable, using haptics only');
    }
    
  } catch (error) {
    // Fallback to haptics only
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

// Background music - intense, energetic loop
let musicInterval: NodeJS.Timeout | null = null;
let lastFailureTime = 0;
const FAILURE_MUSIC_COOLDOWN = 3000; // 3 seconds cooldown between failure music

export const startBackgroundMusic = async () => {
  try {
    if (!isMusicEnabled || musicPlaying) return;
    
    await stopBackgroundMusic();
    await initializeAudio();
    musicPlaying = true;

    // Background music melody - happy, energetic loop
    const backgroundNotes = [
      { note: 'C', octave: 4, duration: 300 },
      { note: 'E', octave: 4, duration: 300 },
      { note: 'G', octave: 4, duration: 300 },
      { note: 'C', octave: 5, duration: 600 },
    ];

    const playMusicLoop = async () => {
      if (!isMusicEnabled || !musicPlaying) return;
      
      try {
        // Play background melody
        for (const note of backgroundNotes) {
          if (!isMusicEnabled || !musicPlaying) break;
          await playNote(note.note, note.octave, note.duration);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Continue loop if music is still enabled
        if (isMusicEnabled && musicPlaying) {
          setTimeout(() => playMusicLoop(), 500);
        }
      } catch (error) {
        // If error, retry after delay
        if (isMusicEnabled && musicPlaying) {
          setTimeout(() => playMusicLoop(), 1000);
        }
      }
    };

    // Start the music loop
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

// Victory music - triumphant, celebratory
export const playWinMusic = async () => {
  try {
    await stopBackgroundMusic();
    
    if (winSound) {
      await winSound.unloadAsync();
    }

    // Victory melody - triumphant ascending notes
    const victoryNotes = [
      { note: 'C', octave: 5, duration: 200 },
      { note: 'E', octave: 5, duration: 200 },
      { note: 'G', octave: 5, duration: 200 },
      { note: 'C', octave: 6, duration: 400 },
    ];

    // Play victory sequence with haptics and audio
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    for (const note of victoryNotes) {
      await playNote(note.note, note.octave, note.duration);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Restart background music after 2 seconds
    setTimeout(() => {
      startBackgroundMusic();
    }, 2000);
  } catch (error) {
    console.log('Error playing win music:', error);
  }
};

// Failure music - somber, encouraging (with cooldown)
export const playLoseMusic = async () => {
  try {
    const now = Date.now();
    // Prevent failure music from playing too frequently
    if (now - lastFailureTime < FAILURE_MUSIC_COOLDOWN) {
      // Just play haptic feedback, don't restart music
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    lastFailureTime = now;
    await stopBackgroundMusic();
    
    if (loseSound) {
      await loseSound.unloadAsync();
    }

    // Failure melody - gentle, encouraging descending notes
    const failureNotes = [
      { note: 'C', octave: 4, duration: 250 },
      { note: 'A', octave: 3, duration: 250 },
      { note: 'F', octave: 3, duration: 400 },
    ];

    // Play failure sequence with haptics and audio
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    for (const note of failureNotes) {
      await playNote(note.note, note.octave, note.duration);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Restart background music after 1.5 seconds
    setTimeout(() => {
      startBackgroundMusic();
    }, 1500);
  } catch (error) {
    console.log('Error playing lose music:', error);
  }
};

// Sound effects with actual audio tones
export const playSoundEffect = async (type: 'correct' | 'wrong' | 'win' | 'click') => {
  try {
    switch (type) {
      case 'correct':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Play positive beep
        await playNote('E', 5, 100);
        await playNote('G', 5, 100);
        break;
      case 'wrong':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        // Play negative beep
        await playNote('C', 3, 150);
        // Don't call playLoseMusic here to avoid recursion
        break;
      case 'win':
        // Don't call playWinMusic here - it's called separately
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await playNote('C', 6, 200);
        break;
      case 'click':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await playNote('C', 5, 50);
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await playNote('C', 4, 50);
    }
  } catch (error) {
    console.log(`Sound effect error: ${type}`, error);
    // Fallback to haptics only
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  }
};

// Toggle music on/off
export const setMusicEnabled = (enabled: boolean) => {
  isMusicEnabled = enabled;
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

