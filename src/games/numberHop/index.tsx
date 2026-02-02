import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, cleanupAudio, initializeAudio, loadSoundSetting } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty, scaleMax } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

const baseMax = 7;
const getMaxNumForLevel = (level: number) => Math.min(level + 1, scaleMax(baseMax, getDifficulty()));

const getLevelDescription = (level: number) => {
  const max = getMaxNumForLevel(level);
  const sequence = Array.from({ length: max }, (_, i) => i + 1).join(' → ');
  return `Tap in order: ${sequence}`;
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const NumberHopGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [nextTap, setNextTap] = useState(1);
  const [showReward, setShowReward] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const scoreRef = useRef(0);

  const maxNum = getMaxNumForLevel(level);
  const numbers = Array.from({ length: maxNum }, (_, i) => i + 1);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>(numbers);

  useFocusEffect(
    useCallback(() => {
      return () => {
        cleanupAudio();
      };
    }, [])
  );

  useEffect(() => {
    loadProgress();
    loadSoundSetting();
    initializeAudio().then(() => {
      startBackgroundMusic();
    });
    return () => stopBackgroundMusic();
  }, []);

  // Shuffle lily pad positions when level changes (or on first load)
  useEffect(() => {
    const nums = Array.from({ length: maxNum }, (_, i) => i + 1);
    setShuffledOrder(shuffleArray(nums));
  }, [level, maxNum]);

  const loadProgress = async () => {
    const progress = await getGameProgress('numberHop');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
      scoreRef.current = progress.score;
    }
  };

  const onTapNumber = async (num: number) => {
    setHint(null);
    if (num === nextTap) {
      playSoundEffect('correct');
      const added = 10;
      scoreRef.current += added;
      setScore(scoreRef.current);
      if (num === maxNum) {
        await playWinMusic();
        const newLevel = level + 1;
        const newScore = scoreRef.current;
        await updateGameProgress('numberHop', { level: newLevel, score: newScore, stars: Math.min(3, level) });
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setLevel(newLevel);
          setScore(newScore);
          setNextTap(1);
        }, 2200);
      } else {
        setNextTap((n) => n + 1);
      }
    } else {
      playSoundEffect('wrong');
      setHint(`That was number ${num}. Tap number ${nextTap} next! 🐸`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Level {level} | Score: {score}</Text>
        <Text style={styles.headerSubtext}>{getLevelDescription(level)}</Text>
      </View>
      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>🐸 What to do</Text>
        <Text style={styles.objectiveText}>
          Tap the lily pads <Text style={styles.objectiveBold}>in order</Text>. Start with 1, then 2, then the next number until you finish!
        </Text>
        <View style={styles.thisLevelRow}>
          <Text style={styles.thisLevelLabel}>This level: </Text>
          <Text style={styles.thisLevelSequence}>{numbers.join(' → ')}</Text>
        </View>
        <View style={styles.nextBox}>
          <Text style={styles.nextLabel}>Tap this one next:</Text>
          <Text style={styles.nextNumber}>{nextTap}</Text>
        </View>
        {hint ? <Text style={styles.hintText}>{hint}</Text> : null}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.padsLabel}>Lily pads – find and tap in order (1 → {maxNum})</Text>
        <View style={styles.pads}>
          {shuffledOrder.map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.pad, num === nextTap && styles.padHighlight]}
              onPress={() => onTapNumber(num)}
              activeOpacity={0.8}
            >
              <Text style={styles.padNumber}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <RewardModal visible={showReward} rewardName="Number Master!" rewardIcon="🐸" onClose={() => setShowReward(false)} />
      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Number Hop"
        icon="🐸"
        steps={[
          { emoji: '🐸', text: 'Help the frog hop! The lily pads are shuffled – find 1, then 2, then the next, in order.' },
          { emoji: '1️⃣', text: 'Look at "Tap this one next" – find that number on a lily pad (they are in random spots!).' },
          { emoji: '➡️', text: 'Tap the next number each time until you finish the sequence. Each level shuffles again!' },
          { emoji: '👆', text: 'Wrong number? No problem! The game will tell you which one to tap next.' },
          { emoji: '⭐', text: 'Finish the order and you level up! Each level adds one more number (up to 7) and a new shuffle.' },
        ]}
        tips={[
          'Each level adds one number: Level 1 = 1→2, Level 2 = 1→2→3, … up to 7 numbers.',
          'Mistakes don’t – The green-highlighted pad is the one you need next.',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  header: { backgroundColor: '#2E7D32', padding: 14, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  headerSubtext: { color: '#A5D6A7', fontSize: 13, marginTop: 4, textAlign: 'center' },
  objectiveBox: {
    backgroundColor: '#43A047',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1B5E20',
  },
  objectiveTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  objectiveText: { fontSize: 16, color: '#fff', textAlign: 'center', lineHeight: 24 },
  objectiveBold: { fontWeight: 'bold', textDecorationLine: 'underline' },
  thisLevelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  thisLevelLabel: { fontSize: 15, color: '#fff' },
  thisLevelSequence: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  nextBox: {
    marginTop: 14,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 140,
    alignItems: 'center',
  },
  nextLabel: { fontSize: 14, color: '#2E7D32', marginBottom: 4 },
  nextNumber: { fontSize: 36, fontWeight: 'bold', color: '#1B5E20' },
  hintText: { fontSize: 14, color: '#fff', marginTop: 12, textAlign: 'center', fontStyle: 'italic' },
  scrollContent: { padding: 16, flexGrow: 1, justifyContent: 'center' },
  padsLabel: { fontSize: 16, fontWeight: '600', color: '#1B5E20', marginBottom: 14, textAlign: 'center' },
  pads: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  pad: {
    width: 76,
    height: 76,
    backgroundColor: '#A5D6A7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  padHighlight: { backgroundColor: '#81C784', borderColor: '#fff', borderWidth: 4 },
  padNumber: { fontSize: 32, fontWeight: 'bold', color: '#1B5E20' },
});

export default NumberHopGame;
