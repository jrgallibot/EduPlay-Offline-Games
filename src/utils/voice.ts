import * as Speech from 'expo-speech';

// Voice feedback using text-to-speech
export const speak = async (text: string, options?: { rate?: number; pitch?: number }) => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
    
    await Speech.speak(text, {
      language: 'en',
      pitch: options?.pitch || 1.0,
      rate: options?.rate || 0.9,
    });
  } catch (error) {
    console.log('Speech error:', error);
  }
};

// Stop speaking
export const stopSpeaking = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    console.log('Stop speech error:', error);
  }
};

