import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { RewardModal } from '../../components/RewardModal';

interface FractionChallenge {
  food: string;
  totalSlices: number;
  targetFraction: { numerator: number; denominator: number };
}

const ChefFractionsGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [challenge, setChallenge] = useState<FractionChallenge | null>(null);
  const [selectedSlices, setSelectedSlices] = useState<number[]>([]);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [showReward, setShowReward] = useState(false);

  const foods = ['🍕', '🍰', '🥧', '🍪', '🧀'];

  useEffect(() => {
    loadProgress();
    generateChallenge();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('chef');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
    }
  };

  const generateChallenge = () => {
    const food = foods[Math.floor(Math.random() * foods.length)];
    const denominators = [2, 3, 4, 6, 8];
    const denominator = denominators[Math.min(level - 1, denominators.length - 1)];
    const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;

    setChallenge({
      food,
      totalSlices: denominator,
      targetFraction: { numerator, denominator },
    });
    setSelectedSlices([]);
  };

  const toggleSlice = (index: number) => {
    if (selectedSlices.includes(index)) {
      setSelectedSlices(selectedSlices.filter((i) => i !== index));
    } else {
      setSelectedSlices([...selectedSlices, index]);
    }
  };

  const checkAnswer = async () => {
    if (!challenge) return;

    const { numerator, denominator } = challenge.targetFraction;
    const correctCount = numerator;

    if (selectedSlices.length === correctCount) {
      playSoundEffect('correct');
      const newScore = score + 20;
      setScore(newScore);
      const newCompleted = challengesCompleted + 1;
      setChallengesCompleted(newCompleted);

      if (newCompleted % 5 === 0) {
        await playWinMusic(); // Play victory music
        const newLevel = level + 1;
        await updateGameProgress('chef', {
          level: newLevel,
          score: newScore,
          stars: Math.min(3, Math.floor(newCompleted / 5)),
        });
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setLevel(newLevel);
        }, 2000);
      }

      Alert.alert(
        'Correct! 🎉',
        `You selected ${numerator}/${denominator} of the ${challenge.food}!`,
        [{ text: 'Next Challenge', onPress: generateChallenge }]
      );
    } else {
      await playLoseMusic(); // Play failure music
      playSoundEffect('wrong');
      Alert.alert(
        'Not Quite!',
        `You need ${correctCount} slices for ${numerator}/${denominator}.`
      );
    }
  };

  if (!challenge) return null;

  const { food, totalSlices, targetFraction } = challenge;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Completed: {challengesCompleted}
        </Text>
      </View>

      <View style={styles.gameContainer}>
        <Text style={styles.title}>🍽️ Chef Fractions 🍽️</Text>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>Select this fraction:</Text>
          <Text style={styles.fraction}>
            {targetFraction.numerator}/{targetFraction.denominator}
          </Text>
        </View>

        <View style={styles.plateContainer}>
          <Text style={styles.plateLabel}>Tap to select slices:</Text>
          <View style={styles.slicesGrid}>
            {Array.from({ length: totalSlices }).map((_, index) => {
              const isSelected = selectedSlices.includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.slice, isSelected && styles.selectedSlice]}
                  onPress={() => toggleSlice(index)}
                >
                  <Text style={styles.food}>{food}</Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            Selected: {selectedSlices.length}/{totalSlices}
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={checkAnswer}>
          <Text style={styles.submitButtonText}>🍴 Serve!</Text>
        </TouchableOpacity>
      </View>

      <RewardModal
        visible={showReward}
        rewardName="Master Chef!"
        rewardIcon="👨‍🍳"
        onClose={() => setShowReward(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    backgroundColor: '#FF6347',
    padding: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  fraction: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  plateContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  plateLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  slicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  slice: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF8DC',
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  selectedSlice: {
    backgroundColor: '#90EE90',
    borderColor: '#4CAF50',
  },
  food: {
    fontSize: 40,
  },
  checkmark: {
    position: 'absolute',
    fontSize: 30,
    color: '#4CAF50',
  },
  selectionInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChefFractionsGame;

