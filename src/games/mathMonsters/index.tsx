import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { generateMathQuestion, calculateStars } from '../../utils/math';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { ProgressBar } from '../../components/ProgressBar';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

const MathMonstersGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(generateMathQuestion(1));
  const [monsterHealth, setMonsterHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [streak, setStreak] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    loadProgress();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  useEffect(() => {
    if (monsterHealth <= 0) {
      handleLevelComplete();
    }
    if (playerHealth <= 0) {
      handleGameOver();
    }
  }, [monsterHealth, playerHealth]);

  const loadProgress = async () => {
    const progress = await getGameProgress('math');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
      setQuestion(generateMathQuestion(progress.level));
    }
  };

  const handleAnswer = (selectedAnswer: number) => {
    setQuestionCount(questionCount + 1);

    if (selectedAnswer === question.answer) {
      // Correct answer
      playSoundEffect('correct');
      const damage = 20 + streak * 5;
      setMonsterHealth(Math.max(0, monsterHealth - damage));
      setScore(score + 10 + streak * 2);
      setStreak(streak + 1);
    } else {
      // Wrong answer
      playSoundEffect('wrong');
      setPlayerHealth(Math.max(0, playerHealth - 15));
      setStreak(0);
    }

    // Generate new question
    setQuestion(generateMathQuestion(level));
  };

  const handleLevelComplete = async () => {
    await playWinMusic(); // Play victory music
    const stars = calculateStars(score, questionCount * 10);
    const newLevel = level + 1;
    const currentScore = score; // Use current score state

    await updateGameProgress('math', {
      level: newLevel,
      score: currentScore,
      stars: stars,
    });

    setShowReward(true);
    setTimeout(() => {
      setShowReward(false);
      setLevel(newLevel);
      resetLevel();
    }, 3000);
  };

  const handleGameOver = async () => {
    await playLoseMusic(); // Play failure music
    Alert.alert(
      'Game Over!',
      `The monster won! But you earned ${score} points. Try again?`,
      [
        {
          text: 'Retry',
          onPress: resetLevel,
        },
      ]
    );
  };

  const resetLevel = () => {
    setMonsterHealth(100);
    setPlayerHealth(100);
    setStreak(0);
    setQuestionCount(0);
    // Don't reset score - keep accumulated score
    setQuestion(generateMathQuestion(level));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statContainer}>
          <Text style={styles.stat}>Level {level}</Text>
          <Text style={styles.stat}>Score: {score}</Text>
          <Text style={styles.stat}>Streak: {streak}🔥</Text>
        </View>
      </View>

      <View style={styles.battleZone}>
        <View style={styles.monsterContainer}>
          <Text style={styles.monster}>👾</Text>
          <ProgressBar
            progress={monsterHealth / 100}
            color="#FF6B6B"
            showPercentage={false}
          />
          <Text style={styles.healthText}>Monster HP: {monsterHealth}</Text>
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.playerContainer}>
          <Text style={styles.player}>🧙</Text>
          <ProgressBar
            progress={playerHealth / 100}
            color="#4CAF50"
            showPercentage={false}
          />
          <Text style={styles.healthText}>Your HP: {playerHealth}</Text>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Solve to Attack!</Text>
        <Text style={styles.question}>{question.question} = ?</Text>
      </View>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <RewardModal
        visible={showReward}
        rewardName="Level Complete!"
        rewardIcon="🏆"
        onClose={() => setShowReward(false)}
      />

      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Math Monsters Arena"
        icon="👾"
        steps={[
          {
            emoji: '➕',
            text: 'Look at the math question at the bottom',
          },
          {
            emoji: '👆',
            text: 'Tap the correct answer from the 4 options',
          },
          {
            emoji: '✅',
            text: 'Correct answer = You attack the monster!',
          },
          {
            emoji: '❌',
            text: 'Wrong answer = Monster attacks you!',
          },
          {
            emoji: '🎯',
            text: 'Beat the monster to win the level!',
          },
        ]}
        tips={[
          'Answer fast for more points!',
          'Get streaks for bonus damage!',
          'Keep your health above 0!',
          'Have fun learning math!',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  header: {
    padding: 15,
    backgroundColor: '#34495E',
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  battleZone: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  monsterContainer: {
    alignItems: 'center',
    width: '80%',
  },
  monster: {
    fontSize: 80,
    marginBottom: 10,
  },
  playerContainer: {
    alignItems: 'center',
    width: '80%',
  },
  player: {
    fontSize: 80,
    marginBottom: 10,
  },
  healthText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  vsContainer: {
    paddingVertical: 10,
  },
  vsText: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  question: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
  },
  optionButton: {
    width: '45%',
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default MathMonstersGame;

