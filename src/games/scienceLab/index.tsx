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
import { getDifficulty } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';

interface Experiment {
  name: string;
  ingredients: string[];
  result: string;
  icon: string;
}

const experiments: Experiment[] = [
  {
    name: 'Volcano',
    ingredients: ['🌋 Baking Soda', '🍋 Vinegar'],
    result: '💥 Eruption!',
    icon: '🌋',
  },
  {
    name: 'Plant Growth',
    ingredients: ['🌱 Seed', '💧 Water', '☀️ Sunlight'],
    result: '🌿 Growing Plant!',
    icon: '🌱',
  },
  {
    name: 'Magnet Power',
    ingredients: ['🧲 Magnet', '📎 Metal'],
    result: '✨ Attraction!',
    icon: '🧲',
  },
  {
    name: 'Rainbow',
    ingredients: ['💧 Water', '☀️ Light', '💎 Prism'],
    result: '🌈 Rainbow!',
    icon: '🌈',
  },
];

const ScienceLabGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [completedExperiments, setCompletedExperiments] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const allIngredients = [
    '🌋 Baking Soda',
    '🍋 Vinegar',
    '🌱 Seed',
    '💧 Water',
    '☀️ Sunlight',
    '🧲 Magnet',
    '📎 Metal',
    '💎 Prism',
    '☀️ Light',
  ];

  useEffect(() => {
    loadProgress();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('science');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
    }
  };

  const selectExperiment = (experiment: Experiment) => {
    setCurrentExperiment(experiment);
    setSelectedIngredients([]);
    setShowResult(false);
  };

  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const runExperiment = async () => {
    if (!currentExperiment) return;

    const correctIngredients = currentExperiment.ingredients;
    const isCorrect =
      selectedIngredients.length === correctIngredients.length &&
      selectedIngredients.every((ing) => correctIngredients.includes(ing));

    if (isCorrect) {
      playSoundEffect('win');
      setShowResult(true);
      const newScore = score + 30;
      setScore(newScore);

      if (!completedExperiments.includes(currentExperiment.name)) {
        const newCompleted = [...completedExperiments, currentExperiment.name];
        setCompletedExperiments(newCompleted);

        const needed = getDifficulty() === 'easy' ? 3 : experiments.length;
        if (newCompleted.length >= needed) {
          await playWinMusic(); // Play victory music
          const newLevel = level + 1;
          await updateGameProgress('science', {
            level: newLevel,
            score: newScore,
            stars: 3,
          });
          setShowReward(true);
          setTimeout(() => {
            setShowReward(false);
            setLevel(newLevel);
            setCompletedExperiments([]);
          }, 3000);
        }
      }

      setTimeout(() => {
        setShowResult(false);
        setCurrentExperiment(null);
      }, 2000);
    } else {
      await playLoseMusic(); // Play failure music
      playSoundEffect('wrong');
      Alert.alert('Not Quite!', 'Try different ingredients!');
    }
  };

  if (showResult && currentExperiment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Success!</Text>
          <Text style={styles.resultIcon}>{currentExperiment.result}</Text>
          <Text style={styles.resultText}>{currentExperiment.name} Complete!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Experiments: {completedExperiments.length}/{experiments.length}
        </Text>
      </View>

      {!currentExperiment ? (
        <View style={styles.experimentsContainer}>
          <Text style={styles.title}>🧪 Choose an Experiment 🧪</Text>
          {experiments.map((exp) => {
            const isCompleted = completedExperiments.includes(exp.name);
            return (
              <TouchableOpacity
                key={exp.name}
                style={[styles.experimentCard, isCompleted && styles.completedCard]}
                onPress={() => selectExperiment(exp)}
              >
                <Text style={styles.experimentIcon}>{exp.icon}</Text>
                <Text style={styles.experimentName}>{exp.name}</Text>
                {isCompleted && <Text style={styles.checkmark}>✅</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.labContainer}>
          <Text style={styles.labTitle}>
            {currentExperiment.icon} {currentExperiment.name}
          </Text>
          <Text style={styles.instruction}>Select the right ingredients:</Text>

          <View style={styles.ingredientsGrid}>
            {allIngredients.map((ingredient) => {
              const isSelected = selectedIngredients.includes(ingredient);
              return (
                <TouchableOpacity
                  key={ingredient}
                  style={[
                    styles.ingredientButton,
                    isSelected && styles.selectedIngredient,
                  ]}
                  onPress={() => toggleIngredient(ingredient)}
                >
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.runButton} onPress={runExperiment}>
            <Text style={styles.runButtonText}>🔬 Run Experiment!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentExperiment(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <RewardModal
        visible={showReward}
        rewardName="Science Master!"
        rewardIcon="🧪"
        onClose={() => setShowReward(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  experimentsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  experimentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  completedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  experimentIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  experimentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  checkmark: {
    fontSize: 30,
  },
  labContainer: {
    padding: 20,
  },
  labTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ingredientButton: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
  },
  selectedIngredient: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  ingredientText: {
    fontSize: 16,
  },
  runButton: {
    backgroundColor: '#FF9800',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  resultIcon: {
    fontSize: 120,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ScienceLabGame;

