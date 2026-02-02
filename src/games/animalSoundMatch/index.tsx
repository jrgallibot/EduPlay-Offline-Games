import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playAnimalSound, initializeAudio, loadSoundSetting } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty, scaleNeeded, scaleChoices } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

const ANIMALS = [
  { emoji: '🐄', name: 'Cow', key: 'cow' },
  { emoji: '🐕', name: 'Dog', key: 'dog' },
  { emoji: '🐱', name: 'Cat', key: 'cat' },
  { emoji: '🐷', name: 'Pig', key: 'pig' },
  { emoji: '🐔', name: 'Chicken', key: 'chicken' },
  { emoji: '🐑', name: 'Sheep', key: 'sheep' },
  { emoji: '🦆', name: 'Duck', key: 'duck' },
  { emoji: '🐸', name: 'Frog', key: 'frog' },
];

const REPEAT_COUNT = 3;
const REPEAT_DELAY_MS = 1200;

const baseNeeded = (level: number) => (level <= 2 ? 2 : level <= 4 ? 3 : 4);
const neededPerLevel = (level: number) => scaleNeeded(baseNeeded(level), getDifficulty());

const AnimalSoundMatchGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<typeof ANIMALS[0] | null>(null);
  const [choices, setChoices] = useState<typeof ANIMALS>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const correctCountRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      loadSoundSetting();
      await initializeAudio();
      if (cancelled) return;
      startBackgroundMusic();
      const progress = await getGameProgress('animalSound');
      if (cancelled) return;
      if (progress) {
        setLevel(progress.level);
        setScore(progress.score);
        scoreRef.current = progress.score;
      }
      newRound();
    })();
    return () => {
      cancelled = true;
      stopBackgroundMusic();
    };
  }, []);

  const playSoundOnce = async (animal: typeof ANIMALS[0]) => {
    await playAnimalSound(animal.key);
  };

  const playSoundThreeTimes = (animal: typeof ANIMALS[0]) => {
    stopBackgroundMusic();
    [0, 1, 2].forEach((i) => {
      setTimeout(() => playSoundOnce(animal), i * REPEAT_DELAY_MS);
    });
    setTimeout(() => startBackgroundMusic(), REPEAT_DELAY_MS * 3 + 1500);
  };

  const newRound = () => {
    setFeedback(null);
    setIsAnswerLocked(false);
    const t = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setTarget(t);
    const others = ANIMALS.filter((a) => a.name !== t.name).sort(() => Math.random() - 0.5);
    const choiceCount = scaleChoices(3, ANIMALS.length, getDifficulty());
    setChoices([t, ...others.slice(0, choiceCount - 1)]);
    setTimeout(() => playSoundThreeTimes(t), 900);
  };

  const onTapAnimal = async (animal: typeof ANIMALS[0]) => {
    if (!target || isAnswerLocked) return;
    if (animal.name === target.name) {
      setIsAnswerLocked(true);
      playSoundEffect('correct');
      setFeedback(`Correct! It's the ${target.name}! ${target.emoji}`);
      correctCountRef.current = correctCount + 1;
      scoreRef.current = score + 20;
      setCorrectCount(correctCountRef.current);
      setScore(scoreRef.current);
      const needed = neededPerLevel(level);
      if (correctCountRef.current >= needed) {
        await playWinMusic();
        const newLevel = level + 1;
        await updateGameProgress('animalSound', {
          level: newLevel,
          score: scoreRef.current,
          stars: Math.min(3, level),
        });
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setLevel(newLevel);
          correctCountRef.current = 0;
          setCorrectCount(0);
          newRound();
        }, 2200);
      } else {
        setTimeout(() => newRound(), 1800);
      }
    } else {
      playSoundEffect('wrong');
      setFeedback('Not quite! Listen again – tap 🔊 to hear the sound 3 times.');
      setTimeout(() => playSoundThreeTimes(target), 600);
    }
  };

  const needed = neededPerLevel(level);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Level {level} | Score: {score} | Correct: {correctCount}/{needed}</Text>
      </View>
      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>🐾 Which animal makes this sound?</Text>
        <Text style={styles.objectiveHint}>The sound plays 3 times – listen, then tap the animal!</Text>
        <TouchableOpacity
          style={styles.replayBtn}
          onPress={() => target && playSoundThreeTimes(target)}
          disabled={!target}
          activeOpacity={0.8}
        >
          <Text style={styles.replayBtnText}>🔊 Hear sound 3 times again</Text>
        </TouchableOpacity>
        {feedback ? (
          <Text style={feedback.startsWith('Correct') ? styles.feedbackCorrect : styles.feedbackWrong}>
            {feedback}
          </Text>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.choices}>
          {choices.map((animal, index) => (
            <TouchableOpacity
              key={`${animal.name}-${index}`}
              style={[styles.animalButton, isAnswerLocked && styles.animalButtonDisabled]}
              onPress={() => onTapAnimal(animal)}
              activeOpacity={0.8}
              disabled={isAnswerLocked}
            >
              <Text style={styles.animalEmoji}>{animal.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <RewardModal visible={showReward} rewardName="Sound Master!" rewardIcon="🐾" onClose={() => setShowReward(false)} />
      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Animal Sound Match"
        icon="🐾"
        steps={[
          { emoji: '🔊', text: 'Listen! Real animal sounds (moo, woof, meow, oink, etc.) play 3 times – match the sound to the animal!' },
          { emoji: '👆', text: 'Tap the animal that matches the sound you hear' },
          { emoji: '🔊', text: 'Tap "Hear sound 3 times again" to hear it again' },
          { emoji: '✅', text: 'Wrong? Same question stays – listen again and try another animal!' },
        ]}
        tips={['The question does not change until you get it right.', 'Level 1–2: 2 correct to level up. Level 3–4: 3. Level 5+: 4.']}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF3E0' },
  header: { backgroundColor: '#E65100', padding: 14 },
  headerText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  objectiveBox: { backgroundColor: '#FF9800', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  objectiveTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  objectiveHint: { fontSize: 14, color: '#fff', marginBottom: 12, textAlign: 'center', opacity: 0.95 },
  replayBtn: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#fff', borderRadius: 20 },
  replayBtnText: { fontSize: 14, fontWeight: '600', color: '#E65100' },
  feedbackCorrect: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20', marginTop: 12, textAlign: 'center' },
  feedbackWrong: { fontSize: 14, color: '#fff', marginTop: 12, textAlign: 'center' },
  scrollContent: { padding: 16, flexGrow: 1, justifyContent: 'center' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  animalButton: { width: 100, height: 100, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFB74D' },
  animalButtonDisabled: { opacity: 0.7 },
  animalEmoji: { fontSize: 50 },
});

export default AnimalSoundMatchGame;
