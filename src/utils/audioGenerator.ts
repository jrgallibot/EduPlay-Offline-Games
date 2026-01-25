// Audio tone generator for offline music
// Generates actual audio tones programmatically

export class AudioToneGenerator {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];

  async initialize() {
    try {
      // Create audio context for generating tones
      // Note: In React Native, we'll use expo-av's capabilities
      // This is a helper class for generating frequencies
    } catch (error) {
      console.log('Audio context initialization error:', error);
    }
  }

  // Generate a simple tone frequency
  getFrequency(note: string, octave: number = 4): number {
    const notes: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const A4 = 440; // A4 = 440Hz
    const noteValue = notes[note] || 9;
    const semitones = noteValue - 9 + (octave - 4) * 12;
    return A4 * Math.pow(2, semitones / 12);
  }

  // Create a melody sequence
  createMelodySequence(notes: Array<{ note: string; octave: number; duration: number }>): number[] {
    return notes.flatMap(n => {
      const freq = this.getFrequency(n.note, n.octave);
      return Array(Math.floor(n.duration / 50)).fill(freq); // 50ms per step
    });
  }

  cleanup() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.oscillators = [];
  }
}

// Background music melody - happy, energetic
export const backgroundMelody = [
  { note: 'C', octave: 4, duration: 200 },
  { note: 'E', octave: 4, duration: 200 },
  { note: 'G', octave: 4, duration: 200 },
  { note: 'C', octave: 5, duration: 400 },
  { note: 'G', octave: 4, duration: 200 },
  { note: 'E', octave: 4, duration: 200 },
  { note: 'C', octave: 4, duration: 400 },
];

// Victory melody - triumphant
export const victoryMelody = [
  { note: 'C', octave: 5, duration: 150 },
  { note: 'E', octave: 5, duration: 150 },
  { note: 'G', octave: 5, duration: 150 },
  { note: 'C', octave: 6, duration: 300 },
  { note: 'G', octave: 5, duration: 150 },
  { note: 'C', octave: 6, duration: 300 },
];

// Failure melody - gentle, encouraging
export const failureMelody = [
  { note: 'C', octave: 4, duration: 200 },
  { note: 'A', octave: 3, duration: 200 },
  { note: 'F', octave: 3, duration: 300 },
];

// Correct sound - short positive beep
export const correctSound = [
  { note: 'E', octave: 5, duration: 100 },
  { note: 'G', octave: 5, duration: 100 },
];

// Wrong sound - short negative beep
export const wrongSound = [
  { note: 'C', octave: 3, duration: 150 },
];

