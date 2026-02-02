import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic, cleanupAudio } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty, scaleLevel } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

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
  const [showGuide, setShowGuide] = useState(true);

  const foods = ['🍕', '🍰', '🥧', '🍪', '🧀'];

  useFocusEffect(
    useCallback(() => {
      return () => {
        cleanupAudio();
      };
    }, [])
  );

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
    const diff = getDifficulty();
    const denominators = diff === 'easy' ? [2, 3, 4] : [2, 3, 4, 6, 8];
    const effectiveLevel = scaleLevel(level, diff);
    const denominator = denominators[Math.min(effectiveLevel - 1, denominators.length - 1)];
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

      const neededForLevel = getDifficulty() === 'easy' ? 4 : getDifficulty() === 'hard' ? 6 : 5;
      if (newCompleted % neededForLevel === 0) {
        await playWinMusic();
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
          generateChallenge();
        }, 2000);
      } else {
        setTimeout(() => generateChallenge(), 1000);
      }
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
  const { numerator, denominator } = targetFraction;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Completed: {challengesCompleted}
        </Text>
        <Text style={styles.headerSubtext}>Complete 5 challenges to level up. Each correct = new fraction!</Text>
      </View>

      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>🎯 Your goal</Text>
        <Text style={styles.objectiveText}>
          Learn fractions! A fraction like <Text style={styles.objectiveBold}>2/4</Text> means <Text style={styles.objectiveBold}>"2 out of 4 parts"</Text>. The <Text style={styles.objectiveBold}>top number</Text> = how many to pick. The <Text style={styles.objectiveBold}>bottom number</Text> = total slices. Tap that many slices, then tap Serve!
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.gameContainer}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionLabel}>This round, choose this fraction:</Text>
            <Text style={styles.fraction}>
              {numerator}/{denominator}
            </Text>
            <Text style={styles.fractionMeaning}>
              = "{numerator} out of {denominator}" → tap <Text style={styles.fractionBold}>{numerator} slice{numerator !== 1 ? 's' : ''}</Text>
            </Text>
          </View>

          <View style={styles.plateContainer}>
            <Text style={styles.plateLabel}>Tap {numerator} slice{numerator !== 1 ? 's' : ''} (the food is cut into {totalSlices} equal parts):</Text>
            <View style={styles.slicesGrid}>
              {Array.from({ length: totalSlices }).map((_, index) => {
                const isSelected = selectedSlices.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.slice, isSelected && styles.selectedSlice]}
                    onPress={() => toggleSlice(index)}
                    activeOpacity={0.8}
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
              You selected: {selectedSlices.length} / {totalSlices} slice{totalSlices !== 1 ? 's' : ''}
            </Text>
            {selectedSlices.length !== numerator && selectedSlices.length > 0 && (
              <Text style={styles.selectionHint}>Need {numerator} slice{numerator !== 1 ? 's' : ''}. Tap more or tap a slice to unselect.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={checkAnswer} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>🍴 Serve!</Text>
        </TouchableOpacity>
      </View>

      <RewardModal
        visible={showReward}
        rewardName="Master Chef!"
        rewardIcon="👨‍🍳"
        onClose={() => setShowReward(false)}
      />

      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Chef Fractions"
        icon="🍕"
        steps={[
          { emoji: '🎯', text: 'Goal: learn what a fraction means by picking the right number of slices' },
          { emoji: '🔢', text: 'A fraction has two numbers: top (numerator) and bottom (denominator)' },
          { emoji: '📖', text: 'Example: 2/4 means "2 out of 4" – so tap 2 slices when the food has 4 slices' },
          { emoji: '👆', text: 'Tap a slice to select it (green). Tap again to unselect' },
          { emoji: '🍴', text: 'When you have the right number of slices, tap "Serve!" at the bottom' },
        ]}
        tips={[
          'Top number = how many slices to pick',
          'Bottom number = how many slices in total',
          'Complete 5 challenges to level up!',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    backgroundColor: '#E65100',
    padding: 14,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  objectiveBox: {
    backgroundColor: '#FF8F00',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E65100',
  },
  objectiveTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  objectiveText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
  },
  objectiveBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  gameContainer: {
    padding: 20,
  },
  instructionBox: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  instructionLabel: {
    fontSize: 16,
    color: '#5D4037',
    marginBottom: 8,
    textAlign: 'center',
  },
  fraction: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#E65100',
    marginVertical: 6,
  },
  fractionMeaning: {
    fontSize: 15,
    color: '#5D4037',
    textAlign: 'center',
    marginTop: 4,
  },
  fractionBold: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  plateContainer: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  plateLabel: {
    fontSize: 15,
    color: '#5D4037',
    textAlign: 'center',
    marginBottom: 14,
  },
  slicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  slice: {
    width: 72,
    height: 72,
    backgroundColor: '#FFF8E1',
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSlice: {
    backgroundColor: '#C8E6C9',
    borderColor: '#2E7D32',
  },
  food: {
    fontSize: 36,
  },
  checkmark: {
    position: 'absolute',
    fontSize: 28,
    color: '#2E7D32',
  },
  selectionInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectionHint: {
    fontSize: 13,
    color: '#E65100',
    marginTop: 6,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 20,
    backgroundColor: '#FFF8F0',
    borderTopWidth: 2,
    borderTopColor: '#FF8F00',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ChefFractionsGame;

