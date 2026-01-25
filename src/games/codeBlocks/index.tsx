import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { RewardModal } from '../../components/RewardModal';

interface Level {
  id: number;
  goal: string;
  blocks: string[];
  gridSize: { rows: number; cols: number };
  robotStart: { row: number; col: number };
  starPosition: { row: number; col: number };
}

const levels: Level[] = [
  {
    id: 1,
    goal: 'Move to the star!',
    blocks: ['MOVE'],
    gridSize: { rows: 3, cols: 3 },
    robotStart: { row: 1, col: 0 },
    starPosition: { row: 1, col: 2 },
  },
  {
    id: 2,
    goal: 'Turn and reach the star!',
    blocks: ['MOVE', 'TURN'],
    gridSize: { rows: 3, cols: 3 },
    robotStart: { row: 0, col: 0 },
    starPosition: { row: 2, col: 2 },
  },
];

const CodeBlocksGame: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [program, setProgram] = useState<string[]>([]);
  const [robotPos, setRobotPos] = useState({ row: 0, col: 0 });
  const [robotDir, setRobotDir] = useState(0); // 0=right, 1=down, 2=left, 3=up
  const [isRunning, setIsRunning] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    loadProgress();
    resetLevel();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, [currentLevel]);

  const loadProgress = async () => {
    const progress = await getGameProgress('code');
    if (progress) {
      setCurrentLevel(progress.level - 1);
      setScore(progress.score);
    }
  };

  const resetLevel = () => {
    const level = levels[currentLevel];
    if (level) {
      setRobotPos(level.robotStart);
      setRobotDir(0);
      setProgram([]);
    }
  };

  const addBlock = (block: string) => {
    setProgram([...program, block]);
  };

  const removeLastBlock = () => {
    setProgram(program.slice(0, -1));
  };

  const runProgram = async () => {
    setIsRunning(true);
    const level = levels[currentLevel];
    let pos = { ...level.robotStart };
    let dir = 0;

    for (const block of program) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (block === 'MOVE') {
        // Move in current direction
        if (dir === 0) pos.col++;
        else if (dir === 1) pos.row++;
        else if (dir === 2) pos.col--;
        else if (dir === 3) pos.row--;

        // Bounds check
        if (
          pos.row < 0 ||
          pos.row >= level.gridSize.rows ||
          pos.col < 0 ||
          pos.col >= level.gridSize.cols
        ) {
          Alert.alert('Oops!', 'Robot went out of bounds!');
          await playLoseMusic(); // Play failure music
          setIsRunning(false);
          resetLevel();
          return;
        }

        setRobotPos({ ...pos });
      } else if (block === 'TURN') {
        dir = (dir + 1) % 4;
        setRobotDir(dir);
      }
    }

    // Check if reached star
    if (
      pos.row === level.starPosition.row &&
      pos.col === level.starPosition.col
    ) {
      await playWinMusic(); // Play victory music
      const newScore = score + 50;
      setScore(newScore);
      const newLevelIndex = currentLevel + 1;
      const newLevel = newLevelIndex + 1; // Convert to 1-based level

      // Save progress for current level completion
      await updateGameProgress('code', {
        level: newLevel,
        score: newScore,
        stars: 3,
      });

      if (currentLevel === levels.length - 1) {
        setShowReward(true);
      } else {
        Alert.alert('Success! 🎉', 'Level Complete!', [
          { text: 'Next Level', onPress: () => setCurrentLevel(newLevelIndex) },
        ]);
      }
    } else {
      await playLoseMusic(); // Play failure music
      playSoundEffect('wrong');
      Alert.alert('Not There Yet!', 'Try a different sequence!');
    }

    setIsRunning(false);
    resetLevel();
  };

  const level = levels[currentLevel];
  if (!level) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.congratsText}>🎉 All Levels Complete! 🎉</Text>
      </SafeAreaView>
    );
  }

  const robotIcon = ['→', '↓', '←', '↑'][robotDir];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {currentLevel + 1} | Score: {score}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.gameContainer}>
          <Text style={styles.goal}>{level.goal}</Text>

          <View style={styles.grid}>
            {Array.from({ length: level.gridSize.rows }).map((_, row) => (
              <View key={row} style={styles.gridRow}>
                {Array.from({ length: level.gridSize.cols }).map((_, col) => {
                  const isRobot = robotPos.row === row && robotPos.col === col;
                  const isStar =
                    level.starPosition.row === row &&
                    level.starPosition.col === col;

                  return (
                    <View key={col} style={styles.gridCell}>
                      {isRobot && (
                        <Text style={styles.robotIcon}>🤖{robotIcon}</Text>
                      )}
                      {isStar && <Text style={styles.starIcon}>⭐</Text>}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.blocksSection}>
            <Text style={styles.sectionTitle}>Available Blocks:</Text>
            <View style={styles.blocksContainer}>
              {level.blocks.map((block) => (
                <TouchableOpacity
                  key={block}
                  style={styles.blockButton}
                  onPress={() => addBlock(block)}
                  disabled={isRunning}
                >
                  <Text style={styles.blockText}>{block}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.programSection}>
            <Text style={styles.sectionTitle}>Your Program:</Text>
            <View style={styles.programContainer}>
              {program.length === 0 ? (
                <Text style={styles.emptyText}>Add blocks to build your program</Text>
              ) : (
                program.map((block, index) => (
                  <View key={index} style={styles.programBlock}>
                    <Text style={styles.programBlockText}>
                      {index + 1}. {block}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeLastBlock}
              disabled={isRunning || program.length === 0}
            >
              <Text style={styles.removeButtonText}>❌ Remove Last</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.runButton}
              onPress={runProgram}
              disabled={isRunning || program.length === 0}
            >
              <Text style={styles.runButtonText}>▶️ Run</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetLevel}>
            <Text style={styles.resetButtonText}>🔄 Reset</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RewardModal
        visible={showReward}
        rewardName="Coding Master!"
        rewardIcon="🚀"
        onClose={() => setShowReward(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    backgroundColor: '#00BCD4',
    padding: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  gameContainer: {
    padding: 20,
  },
  goal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    backgroundColor: '#2E2E2E',
    padding: 10,
    borderRadius: 15,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotIcon: {
    fontSize: 24,
  },
  starIcon: {
    fontSize: 40,
  },
  blocksSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  blocksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  blockButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    margin: 5,
  },
  blockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  programSection: {
    marginBottom: 20,
  },
  programContainer: {
    backgroundColor: '#2E2E2E',
    padding: 15,
    borderRadius: 10,
    minHeight: 100,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  programBlock: {
    backgroundColor: '#00BCD4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  programBlockText: {
    color: '#fff',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  runButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flex: 1,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default CodeBlocksGame;

