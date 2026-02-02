import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { initDB } from './src/database/db';
import { initializeAudio, loadSoundSetting } from './src/utils/sound';

export default function App() {
  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      await initDB();
      if (cancelled) return;
      loadSoundSetting();
      await initializeAudio();
    };
    setup();
    return () => { cancelled = true; };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

