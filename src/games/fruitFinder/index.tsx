import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic, cleanupAudio } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty, scaleNeeded } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

interface Fruit {
  emoji: string;
  name: string;
  hint: string;
}

const fruits: Fruit[] = [
  { emoji: '🍎', name: 'apple', hint: 'Red and crunchy' },
  { emoji: '🍌', name: 'banana', hint: 'Yellow and curved' },
  { emoji: '🍊', name: 'orange', hint: 'Round and orange' },
  { emoji: '🍇', name: 'grape', hint: 'Small and purple' },
  { emoji: '🍓', name: 'strawberry', hint: 'Red with seeds' },
  { emoji: '🍉', name: 'watermelon', hint: 'Big and green outside' },
  { emoji: '🍑', name: 'peach', hint: 'Fuzzy and pink' },
  { emoji: '🍒', name: 'cherry', hint: 'Small and red' },
  { emoji: '🥝', name: 'kiwi', hint: 'Brown outside, green inside' },
  { emoji: '🍐', name: 'pear', hint: 'Green and shaped like a bell' },
  { emoji: '🥭', name: 'mango', hint: 'Yellow and tropical' },
  { emoji: '🍍', name: 'pineapple', hint: 'Spiky and yellow' },
];

const EASY_FRUITS = fruits.slice(0, 6);
const baseRequired = (level: number) => (level <= 2 ? 3 : level <= 4 ? 4 : 5);
const requiredCorrectForLevel = (level: number) => scaleNeeded(baseRequired(level), getDifficulty());

function normalizeInput(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ').replace(/^(a |an )/, '').trim();
}

function isAnswerCorrect(rawInput: string, correctName: string): boolean {
  const raw = normalizeInput(rawInput);
  const correct = correctName.toLowerCase();
  if (raw === '') return false;
  if (raw === correct) return true;
  if (raw === correct + 's') return true;
  if (raw.endsWith('es') && raw.slice(0, -2) === correct) return true;
  if (raw.endsWith('ies') && raw.slice(0, -3) + 'y' === correct) return true;
  if (correct.endsWith('y') && raw === correct.slice(0, -1) + 'ies') return true;
  return false;
}

type Choice = { letter: string; name: string };

function getChoices(correct: Fruit, pool: Fruit[]): Choice[] {
  const others = pool.filter((f) => f.name !== correct.name);
  const wrong = others.sort(() => Math.random() - 0.5).slice(0, 2).map((f) => ({ letter: '', name: f.name }));
  const options: Choice[] = [
    { letter: 'A', name: correct.name },
    { letter: 'B', name: wrong[0].name },
    { letter: 'C', name: wrong[1].name },
  ].sort(() => Math.random() - 0.5);
  options[0].letter = 'A';
  options[1].letter = 'B';
  options[2].letter = 'C';
  return options;
}

const FruitFinderGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentFruit, setCurrentFruit] = useState<Fruit | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [correctFeedback, setCorrectFeedback] = useState('');
  const [choices, setChoices] = useState<Choice[]>([]);
  const correctCountRef = React.useRef(0);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        cleanupAudio();
      };
    }, [])
  );

  useEffect(() => {
    loadProgress();
    startBackgroundMusic();
    generateNewFruit();
    
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('fruit');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
    }
  };

  const getFruitPool = (lvl: number) => {
    const diff = getDifficulty();
    if (diff === 'easy') return lvl <= 4 ? EASY_FRUITS : fruits;
    if (diff === 'hard') return fruits;
    return lvl <= 2 ? EASY_FRUITS : fruits;
  };

  const generateNewFruit = (levelOverride?: number) => {
    const lvl = levelOverride ?? level;
    const pool = getFruitPool(lvl);
    const randomFruit = pool[Math.floor(Math.random() * pool.length)];
    const optionList = getChoices(randomFruit, pool);
    setCurrentFruit(randomFruit);
    setChoices(optionList);
    setUserAnswer('');
    setShowHint(false);
    setCorrectFeedback('');
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    Speech.stop();
    speakTimeoutRef.current = setTimeout(() => {
      speakTimeoutRef.current = null;
      speakQuestion(optionList);
    }, 700);
  };

  const speakQuestion = (optionList?: Choice[]) => {
    const list = optionList ?? choices;
    if (!currentFruit || list.length < 3) return;
    const phrase = `What is this fruit? A. ${list[0].name}. B. ${list[1].name}. C. ${list[2].name}.`;
    Speech.speak(phrase, { rate: 0.65, volume: 1, language: 'en' });
  };

  const checkAnswer = async () => {
    if (!currentFruit) return;
    const answerToCheck = userAnswer;
    const fruitToCheck = currentFruit;

    const isCorrect = isAnswerCorrect(answerToCheck, fruitToCheck.name);

    if (isCorrect) {
      playSoundEffect('correct');
      const newScore = score + 20;
      setScore(newScore);
      correctCountRef.current = correctCount + 1;
      setCorrectCount(correctCountRef.current);

      const required = requiredCorrectForLevel(level);
      if (correctCountRef.current >= required) {
        await playWinMusic();
        const newLevel = level + 1;
        await updateGameProgress('fruit', {
          level: newLevel,
          score: newScore,
          stars: Math.min(3, level),
        });
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setLevel(newLevel);
          correctCountRef.current = 0;
          setCorrectCount(0);
          generateNewFruit(newLevel);
        }, 2000);
      } else {
        setCorrectFeedback(`Correct! It's ${fruitToCheck.name}! Next fruit…`);
        setTimeout(() => {
          setCorrectFeedback('');
          generateNewFruit();
        }, 1000);
      }
    } else {
      await playLoseMusic();
      playSoundEffect('wrong');
      Alert.alert(
        'Not quite!',
        `The answer was "${fruitToCheck.name}". Hint: ${fruitToCheck.hint}`,
        [{ text: 'Try Again', onPress: () => setUserAnswer('') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Correct: {correctCount}/{requiredCorrectForLevel(level)}
        </Text>
        <Text style={styles.headerSubtext}>
          Level {level}: Get {requiredCorrectForLevel(level)} correct to level up. Each correct = new fruit!
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gameContainer}>
          <Text style={styles.title}>🍎 Fruit Finder 🍎</Text>
          <Text style={styles.instruction}>
            What is this fruit? Choose A, B, or C (or type the name)!
          </Text>
          {correctFeedback ? (
            <Text style={styles.correctFeedback}>{correctFeedback}</Text>
          ) : null}

          {currentFruit && (
            <>
              <TouchableOpacity style={styles.hearButton} onPress={() => speakQuestion()}>
                <Text style={styles.hearButtonText}>🔊 Hear: What is this fruit? A. … B. … C. …</Text>
              </TouchableOpacity>

              <View style={styles.fruitContainer}>
                <Text style={styles.fruitEmoji}>{currentFruit.emoji}</Text>
              </View>

              {choices.length >= 3 && (
                <View style={styles.choicesRow}>
                  {choices.map((c) => (
                    <TouchableOpacity
                      key={c.letter}
                      style={[styles.choiceButton, userAnswer === c.name && styles.choiceButtonSelected]}
                      onPress={() => setUserAnswer(c.name)}
                    >
                      <Text style={styles.choiceLetter}>{c.letter}.</Text>
                      <Text style={styles.choiceName}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.hintButton}
                onPress={() => setShowHint(!showHint)}
              >
                <Text style={styles.hintButtonText}>
                  {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
                </Text>
              </TouchableOpacity>

              {showHint && (
                <View style={styles.hintContainer}>
                  <Text style={styles.hintText}>Hint: {currentFruit.hint}</Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Or type the fruit name:</Text>
                <TextInput
                  style={styles.input}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="e.g., apple"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={checkAnswer}
                />
              </View>

              <TouchableOpacity
                style={[styles.checkButton, !userAnswer && styles.checkButtonDisabled]}
                onPress={checkAnswer}
                disabled={!userAnswer}
              >
                <Text style={styles.checkButtonText}>✓ Check Answer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={generateNewFruit}
              >
                <Text style={styles.skipButtonText}>⏭️ Skip This Fruit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <RewardModal
        visible={showReward}
        rewardName="Fruit Expert!"
        rewardIcon="🏆"
        onClose={() => setShowReward(false)}
      />

      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Fruit Finder"
        icon="🍎"
        steps={[
          { emoji: '🔊', text: 'Tap "Hear: What is this fruit? A. … B. … C. …" to hear: What is this fruit? A. apple. B. mango. C. grapes. (the 3 options change each round)' },
          {
            emoji: '👀',
            text: 'Look at the fruit picture shown',
          },
          {
            emoji: '⌨️',
            text: 'Type the name of the fruit (like: apple, banana)',
          },
          {
            emoji: '✅',
            text: 'Tap "Check Answer" to see if you are right',
          },
          {
            emoji: '💡',
            text: 'Tap "Show Hint" if you need help',
          },
          {
            emoji: '🎯',
            text: 'Level 1–2: 3 correct to level up. Level 3–4: 4 correct. Level 5+: 5 correct.',
          },
        ]}
        tips={[
          'Type the fruit name in English',
          'Use small letters (apple not Apple)',
          'Use hints if you are stuck!',
          'Have fun learning fruit names!',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4',
  },
  header: {
    backgroundColor: '#FFC107',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F57C00',
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  correctFeedback: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
    marginVertical: 8,
  },
  hearButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  hearButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  choicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  choiceButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFC107',
    minWidth: 100,
    alignItems: 'center',
  },
  choiceButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  choiceLetter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  choiceName: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  fruitContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fruitEmoji: {
    fontSize: 120,
    textAlign: 'center',
  },
  hintButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  hintButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintContainer: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  hintText: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFC107',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  checkButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },
  checkButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FruitFinderGame;

