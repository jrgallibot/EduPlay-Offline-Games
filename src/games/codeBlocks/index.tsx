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
import { GameGuide } from '../../components/GameGuide';

interface Level {
  id: number;
  goal: string;
  hint: string;
  blocks: string[];
  gridSize: { rows: number; cols: number };
  robotStart: { row: number; col: number };
  starPosition: { row: number; col: number };
}

const levels: Level[] = [
  {
    id: 1,
    goal: 'Get the robot to the star ⭐',
    hint: 'Tap MOVE twice, then tap Run. The robot moves right.',
    blocks: ['MOVE'],
    gridSize: { rows: 3, cols: 3 },
    robotStart: { row: 1, col: 0 },
    starPosition: { row: 1, col: 2 },
  },
  {
    id: 2,
    goal: 'Get the robot to the star ⭐',
    hint: 'Move right twice, then TURN (to face down), then move down twice.',
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
  const [showGuide, setShowGuide] = useState(true);

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
    setProgram((prev) => [...prev, block]);
  };

  const removeLastBlock = () => {
    setProgram((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  const runProgram = async () => {
    if (program.length === 0) return;
    setIsRunning(true);
    const level = levels[currentLevel];
    let pos = { ...level.robotStart };
    let dir = 0;

    for (const block of program) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (block === 'MOVE') {
        if (dir === 0) pos.col++;
        else if (dir === 1) pos.row++;
        else if (dir === 2) pos.col--;
        else if (dir === 3) pos.row--;

        if (
          pos.row < 0 ||
          pos.row >= level.gridSize.rows ||
          pos.col < 0 ||
          pos.col >= level.gridSize.cols
        ) {
          await playLoseMusic();
          setIsRunning(false);
          resetLevel();
          Alert.alert('Out of bounds', 'The robot left the grid. Try a shorter path or use TURN.');
          return;
        }

        setRobotPos({ ...pos });
      } else if (block === 'TURN') {
        dir = (dir + 1) % 4;
        setRobotDir(dir);
      }
    }

    const reachedStar =
      pos.row === level.starPosition.row && pos.col === level.starPosition.col;

    if (reachedStar) {
      await playWinMusic();
      const newScore = score + 50;
      setScore(newScore);
      const newLevelIndex = currentLevel + 1;
      const newLevel = newLevelIndex + 1;

      await updateGameProgress('code', {
        level: newLevel,
        score: newScore,
        stars: 3,
      });

      setIsRunning(false);

      if (currentLevel >= levels.length - 1) {
        setShowReward(true);
      } else {
        Alert.alert(
          'Level complete! 🎉',
          'Tap "Next level" to continue.',
          [{ text: 'Next level', onPress: () => setCurrentLevel(newLevelIndex) }]
        );
      }
      return;
    }

    await playLoseMusic();
    playSoundEffect('wrong');
    setIsRunning(false);
    resetLevel();
    Alert.alert(
      'Not at the star yet',
      'Change your blocks and try again. Use Remove Last to undo.'
    );
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
          Level {currentLevel + 1} of {levels.length} | Score: {score}
        </Text>
      </View>

      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>🎯 Your goal</Text>
        <Text style={styles.objectiveText}>
          Build a program with the blocks below so the robot reaches the star ⭐. Tap blocks to add them to "Your program", then tap <Text style={styles.objectiveBold}>Run</Text>.
        </Text>
        <Text style={styles.levelHint}>{level.hint}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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

      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Code Blocks"
        icon="🤖"
        steps={[
          { emoji: '🎯', text: 'Goal: get the robot 🤖 to the star ⭐ by building a program' },
          { emoji: '📦', text: 'Tap a block (MOVE or TURN) to add it to "Your program"' },
          { emoji: '▶️', text: 'Tap Run to run your program. The robot will move step by step' },
          { emoji: '↩️', text: 'Wrong move? Tap "Remove Last" to remove the last block' },
          { emoji: '🔄', text: 'Tap Reset to start the level over' },
        ]}
        tips={[
          'MOVE = robot moves one step in the direction it is facing (→ ↓ ← ↑)',
          'TURN = robot turns right (→ then ↓ then ← then ↑)',
          'Add enough MOVE blocks to reach the star!',
        ]}
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
  objectiveBox: {
    backgroundColor: '#37474F',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#455A64',
  },
  objectiveTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  objectiveText: {
    fontSize: 14,
    color: '#ECEFF1',
    lineHeight: 22,
  },
  objectiveBold: {
    fontWeight: 'bold',
    color: '#81C784',
  },
  levelHint: {
    fontSize: 13,
    color: '#B0BEC5',
    marginTop: 10,
    fontStyle: 'italic',
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

