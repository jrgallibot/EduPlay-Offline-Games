import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, initializeAudio, loadSoundSetting } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty, scaleNeeded, scaleChoices } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const baseNeeded = (level: number) => (level <= 1 ? 2 : level <= 2 ? 3 : 4);
const getNeededPerLevel = (level: number) => scaleNeeded(baseNeeded(level), getDifficulty());

type Round = { targetLetter: string; balloons: string[] };

const LetterPopBalloonsGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const scoreRef = useRef(0);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const neededPerLevel = getNeededPerLevel(level);
  const targetLetter = round?.targetLetter ?? '';
  const balloons = round?.balloons ?? [];

  useEffect(() => {
    loadProgress();
    loadSoundSetting();
    initializeAudio().then(() => {
      startBackgroundMusic();
    });
    return () => stopBackgroundMusic();
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('letterPop');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
      scoreRef.current = progress.score;
    }
    newRound();
  };

  const speakLetter = (letter: string) => {
    if (!letter) return;
    Speech.speak(`Pop the letter ${letter}`, { rate: 0.85, language: 'en' });
  };

  const newRound = () => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    Speech.stop();
    const target = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const others = LETTERS.filter((l) => l !== target);
    const shuffledOthers = others.sort(() => Math.random() - 0.5);
    const numBalloons = scaleChoices(6, 26, getDifficulty());
    const balloonList = [target, ...shuffledOthers.slice(0, numBalloons - 1)];
    setRound({ targetLetter: target, balloons: balloonList });
    setFeedback(null);
    speakTimeoutRef.current = setTimeout(() => {
      speakTimeoutRef.current = null;
      speakLetter(target);
    }, 500);
  };

  const onPop = async (letter: string) => {
    if (!round) return;
    if (letter === round.targetLetter) {
      playSoundEffect('correct');
      setFeedback(`Correct! That's the letter ${letter}! 🎈`);
      scoreRef.current += 15;
      setScore(scoreRef.current);
      const newCount = correctCount + 1;
      setCorrectCount(newCount);
      if (newCount >= neededPerLevel) {
        await playWinMusic();
        const newLevel = level + 1;
        await updateGameProgress('letterPop', { level: newLevel, score: scoreRef.current, stars: Math.min(3, level) });
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setLevel(newLevel);
          setCorrectCount(0);
          newRound();
        }, 2200);
      } else {
        setTimeout(() => {
          setFeedback(null);
          newRound();
        }, 1200);
      }
    } else {
      playSoundEffect('wrong');
      setFeedback(`That was "${letter}". Tap the "${round.targetLetter}" balloon! 🎈`);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Level {level} | Score: {score}</Text>
        <Text style={styles.headerSubtext}>Find the letter: {correctCount} of {neededPerLevel} correct</Text>
      </View>
      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>🎈 What to do</Text>
        <Text style={styles.objectiveText}>
          Listen! The game says &quot;Pop the letter [letter]&quot;. Tap the balloon that shows <Text style={styles.objectiveBold}>that</Text> letter.
        </Text>
        <View style={styles.findRow}>
          <Text style={styles.findLabel}>Find and tap this letter:</Text>
          <View style={styles.targetLetterBox}>
            <Text style={styles.targetLetter}>{targetLetter || '?'}</Text>
          </View>
          <TouchableOpacity style={styles.replayVoice} onPress={() => targetLetter && speakLetter(targetLetter)}>
            <Text style={styles.replayVoiceText}>🔊 Hear again</Text>
          </TouchableOpacity>
        </View>
        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.balloonsLabel}>Tap the balloon with the letter above</Text>
        <View style={styles.balloonsRow}>
          {balloons.map((letter, index) => (
            <TouchableOpacity key={`${letter}-${index}`} style={styles.balloon} onPress={() => onPop(letter)} activeOpacity={0.8}>
              <Text style={styles.balloonLetter}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <RewardModal visible={showReward} rewardName="Letter Master!" rewardIcon="🔤" onClose={() => setShowReward(false)} />
      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Letter Pop Balloons"
        icon="🎈"
        steps={[
          { emoji: '🎈', text: 'Listen! The game says "Pop the letter B!" (or another letter).' },
          { emoji: '👀', text: 'Look at the big letter at the top – that is the one to find.' },
          { emoji: '👆', text: 'Tap the balloon that has that same letter. Tap 🔊 to hear again.' },
          { emoji: '❌', text: 'Wrong balloon? The game will say "That was X. Tap the Y balloon!" – then try again.' },
          { emoji: '⭐', text: 'Level 1: get 2 right. Level 2: get 3 right. Level 3+: get 4 right to level up!' },
        ]}
        tips={[
          'The letter to find is always shown at the top and said by the voice.',
          'Wrong tap does not punish – just tap the correct balloon.',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  header: { backgroundColor: '#1976D2', padding: 14, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  headerSubtext: { color: '#BBDEFB', fontSize: 13, marginTop: 4, textAlign: 'center' },
  objectiveBox: { backgroundColor: '#42A5F5', margin: 16, padding: 18, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#0D47A1' },
  objectiveTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  objectiveText: { fontSize: 16, color: '#fff', textAlign: 'center', lineHeight: 24, marginBottom: 8 },
  objectiveBold: { fontWeight: 'bold', textDecorationLine: 'underline' },
  findRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  findLabel: { fontSize: 15, color: '#fff' },
  targetLetterBox: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 16, minWidth: 56, alignItems: 'center' },
  targetLetter: { fontSize: 36, fontWeight: 'bold', color: '#0D47A1' },
  replayVoice: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: 20 },
  replayVoiceText: { fontSize: 14, fontWeight: '600', color: '#1976D2' },
  feedbackText: { fontSize: 16, color: '#fff', marginTop: 12, textAlign: 'center', fontWeight: '600' },
  scrollContent: { padding: 16, flexGrow: 1, justifyContent: 'center' },
  balloonsLabel: { fontSize: 16, fontWeight: '600', color: '#0D47A1', marginBottom: 14, textAlign: 'center' },
  balloonsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  balloon: { width: 80, height: 80, backgroundColor: '#BBDEFB', borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1976D2' },
  balloonLetter: { fontSize: 32, fontWeight: 'bold', color: '#0D47A1' },
});

export default LetterPopBalloonsGame;
