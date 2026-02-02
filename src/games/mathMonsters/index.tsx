import React, { useState, useEffect, useRef } from 'react';
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
import { getDifficulty } from '../../utils/difficulty';
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
  const [isAnswering, setIsAnswering] = useState(false);
  const progressLoadedRef = useRef(false);
  const levelCompleteRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const progress = await getGameProgress('math');
      if (cancelled || progressLoadedRef.current || levelCompleteRef.current) return;
      if (progress) {
        setLevel(progress.level);
        setScore(progress.score);
        setQuestion(generateMathQuestion(progress.level, getDifficulty()));
      }
      progressLoadedRef.current = true;
    })();
    startBackgroundMusic();
    return () => {
      cancelled = true;
      stopBackgroundMusic();
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

  const handleAnswer = (selectedAnswer: number) => {
    if (isAnswering) return;
    setIsAnswering(true);

    const correct = selectedAnswer === question.answer;
    if (correct) {
      playSoundEffect('correct');
      setQuestionCount((c) => c + 1);
      setMonsterHealth((h) => Math.max(0, h - (20 + streak * 5)));
      setScore((s) => s + 10 + streak * 2);
      setStreak((k) => k + 1);
    } else {
      playSoundEffect('wrong');
      setPlayerHealth((h) => Math.max(0, h - 15));
      setStreak(0);
    }

    setQuestion(generateMathQuestion(level, getDifficulty()));
    setTimeout(() => setIsAnswering(false), 400);
  };

  const handleLevelComplete = async () => {
    if (levelCompleteRef.current) return;
    levelCompleteRef.current = true;

    await playWinMusic();
    const stars = calculateStars(score, Math.max(1, questionCount) * 10);
    const newLevel = level + 1;

    await updateGameProgress('math', {
      level: newLevel,
      score: score,
      stars: stars,
    });

    setLevel(newLevel);
    setShowReward(true);
    setTimeout(() => {
      setShowReward(false);
      resetLevel();
      levelCompleteRef.current = false;
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
    setQuestion(generateMathQuestion(level, getDifficulty()));
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
            style={[styles.optionButton, isAnswering && styles.optionButtonDisabled]}
            onPress={() => handleAnswer(option)}
            disabled={isAnswering}
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
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default MathMonstersGame;

