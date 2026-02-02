import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { initDB } from './src/database/db';
import { initializeAudio, loadSoundSetting } from './src/utils/sound';

// Single scroll on web: app fills viewport; only inner ScrollView scrolls (no body scroll).
const rootStyle = Platform.OS === 'web'
  ? { flex: 1 as const, height: '100vh' as unknown as number, overflow: 'hidden' as const }
  : { flex: 1 as const };

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

  // Web: lock viewport so only the in-app ScrollView scrolls (no double scrollbar)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    html.style.height = '100%';
    html.style.overflow = 'hidden';
    body.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.margin = '0';
    const root = document.getElementById('root');
    if (root) {
      const el = root as HTMLElement;
      el.style.height = '100%';
      el.style.minHeight = '100%';
      el.style.overflow = 'hidden';
    }
  }, []);

  return (
    <GestureHandlerRootView style={rootStyle}>
      <View style={navWrapStyle}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </GestureHandlerRootView>
  );
}

const navWrapStyle = { flex: 1, minHeight: 0 };

