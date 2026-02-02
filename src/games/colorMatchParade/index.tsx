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
import { getDifficulty, scaleNeeded } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

const COLORS = [
  { emoji: '🔴', name: 'red', hex: '#E53935' },
  { emoji: '🔵', name: 'blue', hex: '#1E88E5' },
  { emoji: '🟢', name: 'green', hex: '#43A047' },
  { emoji: '🟡', name: 'yellow', hex: '#FDD835' },
  { emoji: '🟣', name: 'purple', hex: '#8E24AA' },
  { emoji: '🟠', name: 'orange', hex: '#FB8C00' },
];

const getHex = (name: string) => COLORS.find((c) => c.name === name)?.hex ?? '#999';

const ANIMALS_BY_COLOR: Record<string, string[]> = {
  red: ['🐄', '🐙', '🐞', '🦀', '🐛'],
  blue: ['🐋', '🐦', '🦋', '🐟', '🐬'],
  green: ['🐸', '🐢', '🐊', '🦎', '🐛'],
  yellow: ['🐥', '🦆', '🐝', '🐤', '🦁'],
  purple: ['🐙', '🦄', '🐸', '🐌', '🦋'],
  orange: ['🐯', '🦊', '🐻', '🐸', '🐠'],
};

const baseNeeded = (level: number) => (level <= 1 ? 3 : level <= 2 ? 4 : 5);
const getNeededPerLevel = (level: number) => scaleNeeded(baseNeeded(level), getDifficulty());

const ColorMatchParadeGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [parade, setParade] = useState<{ emoji: string; color: string }[]>([]);
  const [hits, setHits] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const scoreRef = useRef(0);

  const neededPerLevel = getNeededPerLevel(level);

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
      startParade();
      startBackgroundMusic();
    });
    return () => stopBackgroundMusic();
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('colorMatch');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
      scoreRef.current = progress.score;
    }
  };

  const startParade = () => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(color);
    const animals = ANIMALS_BY_COLOR[color.name] || ANIMALS_BY_COLOR.red;
    const otherColors = COLORS.filter((c) => c.name !== color.name);
    const row: { emoji: string; color: string }[] = [];
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) {
        row.push({ emoji: animals[i % animals.length], color: color.name });
      } else {
        const other = otherColors[Math.floor(Math.random() * otherColors.length)];
        const otherAnimals = ANIMALS_BY_COLOR[other.name] || ANIMALS_BY_COLOR.blue;
        row.push({ emoji: otherAnimals[i % otherAnimals.length], color: other.name });
      }
    }
    setParade(row);
    setHits(0);
    setFeedback(null);
  };

  const onTapAnimal = async (color: string) => {
    if (!targetColor) return;
    if (color === targetColor.name) {
      playSoundEffect('correct');
      setFeedback(`Correct! That's ${targetColor.name}! 🌈`);
      scoreRef.current += 10;
      setScore(scoreRef.current);
      const newHits = hits + 1;
      setHits(newHits);
      if (newHits >= neededPerLevel) {
        await playWinMusic();
        const newLevel = level + 1;
        await updateGameProgress('colorMatch', { level: newLevel, score: scoreRef.current, stars: Math.min(3, level) });
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setLevel(newLevel);
          setHits(0);
          startParade();
        }, 2200);
      } else {
        setTimeout(() => {
          setFeedback(null);
          startParade();
        }, 800);
      }
    } else {
      playSoundEffect('wrong');
      const wrongColorName = color;
      setFeedback(`That one is ${wrongColorName}! Tap only the ${targetColor.name} ones! 🌈`);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Level {level} | Score: {score}</Text>
        <Text style={styles.headerSubtext}>Tap the same color: {hits} of {neededPerLevel} correct</Text>
      </View>
      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>🌈 What to do</Text>
        <Text style={styles.objectiveText}>
          Look at the color at the top. Tap only the animals inside a box of the <Text style={styles.objectiveBold}>same color</Text>!
        </Text>
        <View style={styles.targetRow}>
          <Text style={styles.targetLabel}>Tap only this color:</Text>
          <View style={[styles.targetColorBox, { backgroundColor: targetColor.hex }]}>
            <Text style={styles.targetEmoji}>{targetColor.emoji}</Text>
            <Text style={styles.targetColorName}>{targetColor.name}</Text>
          </View>
        </View>
        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.paradeLabel}>Tap the animals in the SAME color box as above</Text>
        <View style={styles.parade}>
          {parade.map((item, index) => (
            <TouchableOpacity
              key={`${item.color}-${index}`}
              style={[styles.animalButton, { backgroundColor: getHex(item.color) }]}
              onPress={() => onTapAnimal(item.color)}
              activeOpacity={0.8}
            >
              <Text style={styles.animalEmoji}>{item.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <RewardModal visible={showReward} rewardName="Color Master!" rewardIcon="🌈" onClose={() => setShowReward(false)} />
      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Color Match Parade"
        icon="🌈"
        steps={[
          { emoji: '🌈', text: 'Look at the color at the top – that is the color you need to match.' },
          { emoji: '👀', text: 'Each animal sits in a colored box. Tap only the animals whose box is the SAME color as the one at the top.' },
          { emoji: '❌', text: 'Wrong color? The game will say "That one is blue! Tap only the red ones!" – then tap a red box.' },
          { emoji: '⭐', text: 'Level 1: get 3 right. Level 2: get 4 right. Level 3+: get 5 right to level up!' },
        ]}
        tips={[
          'Match the BOX color to the color at the top, not the animal.',
          'Wrong tap does not punish – just tap the correct color next.',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E1' },
  header: { backgroundColor: '#E65100', padding: 14, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  headerSubtext: { color: '#FFE0B2', fontSize: 13, marginTop: 4, textAlign: 'center' },
  objectiveBox: { backgroundColor: '#FF9800', margin: 16, padding: 18, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#E65100' },
  objectiveTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  objectiveText: { fontSize: 16, color: '#fff', textAlign: 'center', lineHeight: 24, marginBottom: 10 },
  objectiveBold: { fontWeight: 'bold', textDecorationLine: 'underline' },
  targetRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  targetLabel: { fontSize: 16, color: '#fff', fontWeight: '600' },
  targetColorBox: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center', minWidth: 80, borderWidth: 3, borderColor: '#fff' },
  targetEmoji: { fontSize: 40 },
  targetColorName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 4, textTransform: 'capitalize' },
  feedbackText: { fontSize: 16, color: '#fff', marginTop: 12, textAlign: 'center', fontWeight: '600' },
  scrollContent: { padding: 16, flexGrow: 1 },
  paradeLabel: { fontSize: 16, fontWeight: '600', color: '#E65100', marginBottom: 14, textAlign: 'center' },
  parade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  animalButton: { width: 76, height: 76, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(0,0,0,0.2)' },
  animalEmoji: { fontSize: 40 },
});

export default ColorMatchParadeGame;
