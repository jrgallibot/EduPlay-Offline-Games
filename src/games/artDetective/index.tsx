import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { random } from '../../utils/math';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty, scaleLevel } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

const ArtDetectiveGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [shapes, setShapes] = useState<string[]>([]);
  const [targetShape, setTargetShape] = useState('');
  const [foundCount, setFoundCount] = useState(0);
  const [totalToFind, setTotalToFind] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const scoreRef = useRef(0);

  const shapeEmojis = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⭐', '💎', '🔷', '🔶'];

  useEffect(() => {
    loadProgress();
    generateLevel();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('art');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
      scoreRef.current = progress.score;
    }
  };

  const generateLevel = () => {
    const effLevel = scaleLevel(level, getDifficulty());
    const newShapes: string[] = [];
    const target = shapeEmojis[random(0, shapeEmojis.length - 1)];
    const targetCount = 3 + effLevel;

    // Add target shapes
    for (let i = 0; i < targetCount; i++) {
      newShapes.push(target);
    }

    // Add other shapes
    const gridSize = 16 + effLevel * 4;
    for (let i = targetCount; i < gridSize; i++) {
      let randomShape;
      do {
        randomShape = shapeEmojis[random(0, shapeEmojis.length - 1)];
      } while (randomShape === target);
      newShapes.push(randomShape);
    }

    // Shuffle
    for (let i = newShapes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newShapes[i], newShapes[j]] = [newShapes[j], newShapes[i]];
    }

    setShapes(newShapes);
    setTargetShape(target);
    setFoundCount(0);
    setTotalToFind(targetCount);
  };

  const handleShapePress = async (shape: string, index: number) => {
    if (shape !== targetShape) {
      playSoundEffect('wrong');
      Alert.alert('Oops!', 'That\'s not the right shape. Try again!');
      return;
    }
    if (shape === '✓') return; // already found

    playSoundEffect('correct');
    const newShapes = [...shapes];
    newShapes[index] = '✓';
    const remaining = newShapes.filter(s => s === targetShape).length;

    setShapes(newShapes);
    setFoundCount((prev) => prev + 1);
    scoreRef.current += 10;
    setScore(scoreRef.current);

    if (remaining === 0) {
      await playWinMusic();
      const newLevel = level + 1;
      const newScore = scoreRef.current;
      await updateGameProgress('art', {
        level: newLevel,
        score: newScore,
        stars: Math.min(3, level),
      });
      setShowReward(true);
      setTimeout(() => {
        setShowReward(false);
        setLevel(newLevel);
        scoreRef.current = newScore;
        setScore(newScore);
        generateLevel();
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score}
        </Text>
      </View>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>Find and tap every:</Text>
        <Text style={styles.targetShape}>{targetShape}</Text>
        <Text style={styles.progressText}>
          Found: {foundCount} / {totalToFind}
        </Text>
        <Text style={styles.hintText}>Tap each one. When all are found, you advance!</Text>
      </View>

      <View style={styles.grid}>
        {shapes.map((shape, index) => (
          <TouchableOpacity
            key={index}
            style={styles.shapeButton}
            onPress={() => handleShapePress(shape, index)}
          >
            <Text style={styles.shape}>{shape}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <RewardModal
        visible={showReward}
        rewardName="Art Detective Master!"
        rewardIcon="🎨"
        onClose={() => setShowReward(false)}
      />
      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Art Detective"
        icon="🎨"
        steps={[
          { emoji: '🎯', text: 'Look at the shape at the top – that is the one to find.' },
          { emoji: '👆', text: 'Tap every tile that shows that same shape. Skip the others!' },
          { emoji: '✅', text: 'When you tap all of them, you level up. Each level has more shapes to find.' },
        ]}
        tips={['Wrong shape? No problem – just tap the right one next.', 'Level 1 = 3 to find, then more each level.']}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  header: {
    backgroundColor: '#FF9800',
    padding: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionBox: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  targetShape: {
    fontSize: 60,
    marginVertical: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  shapeButton: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  shape: {
    fontSize: 30,
  },
});

export default ArtDetectiveGame;

