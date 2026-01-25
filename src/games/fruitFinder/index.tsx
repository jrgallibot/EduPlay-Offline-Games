import React, { useState, useEffect } from 'react';
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
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
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

const FruitFinderGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentFruit, setCurrentFruit] = useState<Fruit | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

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

  const generateNewFruit = () => {
    const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    setCurrentFruit(randomFruit);
    setUserAnswer('');
    setShowHint(false);
  };

  const checkAnswer = async () => {
    if (!currentFruit) return;

    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrect = currentFruit.name.toLowerCase();

    if (normalizedAnswer === normalizedCorrect) {
      await playWinMusic();
      playSoundEffect('correct');
      const newScore = score + 20;
      setScore(newScore);
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);

      // Level up every 5 correct answers
      if (newCorrectCount >= 5) {
        const newLevel = level + 1;
        await updateGameProgress('fruit', {
          level: newLevel,
          score: newScore,
          stars: 3,
        });
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setLevel(newLevel);
          setCorrectCount(0);
          generateNewFruit();
        }, 2000);
      } else {
        Alert.alert('🎉 Correct!', `Yes! It's a ${currentFruit.name}!`, [
          { text: 'Next Fruit', onPress: generateNewFruit },
        ]);
      }
    } else {
      await playLoseMusic();
      playSoundEffect('wrong');
      Alert.alert(
        'Not quite!',
        `Try again! Hint: ${currentFruit.hint}`,
        [{ text: 'Try Again', onPress: () => setUserAnswer('') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Correct: {correctCount}/5
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gameContainer}>
          <Text style={styles.title}>🍎 Fruit Finder 🍎</Text>
          <Text style={styles.instruction}>
            What fruit is this? Type the name below!
          </Text>

          {currentFruit && (
            <>
              <View style={styles.fruitContainer}>
                <Text style={styles.fruitEmoji}>{currentFruit.emoji}</Text>
              </View>

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
                <Text style={styles.inputLabel}>Type the fruit name:</Text>
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
            text: 'Answer 5 fruits correctly to level up!',
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
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 30,
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

