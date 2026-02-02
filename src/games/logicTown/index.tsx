import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic } from '../../utils/sound';
import { speak } from '../../utils/voice';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

interface Building {
  type: string;
  position: number;
  stable: boolean;
}

const LogicTownGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const allBuildings = ['🏠', '🏢', '🏪', '🏫', '🏥'];
  const buildingCount = getDifficulty() === 'easy' ? 3 : 5;
  const [availableBuildings, setAvailableBuildings] = useState<string[]>(allBuildings.slice(0, buildingCount));
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showGuide, setShowGuide] = useState(true); // Show guide on first load

  const gridSize = 5;

  useEffect(() => {
    loadProgress();
    startBackgroundMusic(); // Start intense background music
    // Welcome message with voice
    setTimeout(() => {
      speak('Welcome to Logic Town Builder!');
    }, 500);
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('logic');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
    }
  };

  const selectBuilding = async (building: string) => {
    setSelectedBuilding(building);
    playSoundEffect('click');
    // Voice feedback is optional - can be enabled if needed
    // await speak(`Selected ${building}`);
  };

  const placeBuilding = async (position: number) => {
    if (!selectedBuilding) {
      Alert.alert('Select a Building', 'Choose a building type first!');
      return;
    }

    // Check if position is already occupied
    if (buildings.some((b) => b.position === position)) {
      Alert.alert('Occupied', 'This spot is already taken!');
      return;
    }

    // Logic check: buildings need support
    const isGroundLevel = position >= gridSize * 4;
    const hasSupport =
      isGroundLevel ||
      buildings.some(
        (b) => b.position === position + gridSize && b.stable
      );

    if (!hasSupport) {
      await playLoseMusic(); // Play failure music
      await playSoundEffect('wrong');
      await speak('Unstable! Start from the ground!');
      Alert.alert(
        'Unstable!',
        'Buildings need support below them. Start from the ground!'
      );
      return;
    }

    await playSoundEffect('correct');
    // Voice feedback for successful placement
    // await speak('Great!');
    const newBuilding: Building = {
      type: selectedBuilding,
      position,
      stable: true,
    };

    const newBuildings = [...buildings, newBuilding];
    setBuildings(newBuildings);
    setScore(score + 10);

    // Remove used building
    const newAvailable = [...availableBuildings];
    const index = newAvailable.indexOf(selectedBuilding);
    if (index > -1) {
      newAvailable.splice(index, 1);
    }
    setAvailableBuildings(newAvailable);
    setSelectedBuilding(null);

    // Check if level complete
    if (newAvailable.length === 0) {
      completeLevel();
    }
  };

  const completeLevel = async () => {
    await playWinMusic(); // Play victory music
    await playSoundEffect('win');
    await speak('Congratulations! Level complete! You are a master architect!');
    const newScore = score + 50;
    setScore(newScore);
    const newLevel = level + 1;

    await updateGameProgress('logic', {
      level: newLevel,
      score: newScore,
      stars: Math.min(3, level),
    });

    setShowReward(true);
    setTimeout(() => {
      setShowReward(false);
      setLevel(newLevel);
      resetTown();
    }, 2000);
  };

  const resetTown = () => {
    setBuildings([]);
    const n = getDifficulty() === 'easy' ? 3 : 5;
    setAvailableBuildings(allBuildings.slice(0, n));
    setSelectedBuilding(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score}
        </Text>
      </View>

      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>🎯 Your goal</Text>
        <Text style={styles.objectiveText}>
          Place all 5 buildings to build a town. <Text style={styles.objectiveBold}>Rule: Every building must stand on the ground or on top of another building.</Text> You cannot build in the air! Start with the brown row (ground), then build upward.
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.gameContainer}>
          <Text style={styles.stepLabel}>Step 1 – Pick a building:</Text>
          <View style={styles.buildingsPanel}>
            <View style={styles.buildingsContainer}>
              {availableBuildings.length === 0 ? (
                <Text style={styles.emptyText}>All buildings placed! 🎉</Text>
              ) : (
                availableBuildings.map((building, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.buildingButton,
                      selectedBuilding === building && styles.selectedBuildingButton,
                    ]}
                    onPress={() => selectBuilding(building)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buildingButtonIcon}>{building}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
            {selectedBuilding && (
              <Text style={styles.selectedHint}>Selected: {selectedBuilding} – now tap a green spot below</Text>
            )}
          </View>

          <Text style={styles.stepLabel}>Step 2 – Tap where to place it:</Text>
          <View style={styles.legend}>
            <Text style={styles.legendText}>🟤 Ground (start here)</Text>
            <Text style={styles.legendText}>🟢 Can place</Text>
            <Text style={styles.legendText}>🔴 Need support below</Text>
          </View>
          <View style={styles.gridContainer}>
            <View style={styles.grid}>
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const building = buildings.find((b) => b.position === index);
                const isGroundLevel = index >= gridSize * 4;
                const row = Math.floor(index / gridSize);
                const canPlace = selectedBuilding && !building && (isGroundLevel || buildings.some((b) => b.position === index + gridSize && b.stable));

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.gridCell,
                      isGroundLevel && styles.groundCell,
                      canPlace && styles.availableCell,
                      selectedBuilding && !building && !canPlace && !isGroundLevel && styles.unavailableCell,
                    ]}
                    onPress={() => placeBuilding(index)}
                    disabled={!selectedBuilding}
                  >
                    {building ? (
                      <Text style={styles.buildingIcon}>{building.type}</Text>
                    ) : isGroundLevel ? (
                      <Text style={styles.groundLabel}>🌍</Text>
                    ) : (
                      <Text style={styles.emptyLabel}>⬜</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetTown} activeOpacity={0.8}>
            <Text style={styles.resetButtonText}>🔄 Reset Town</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RewardModal
        visible={showReward}
        rewardName="Master Architect!"
        rewardIcon="🏗️"
        onClose={() => setShowReward(false)}
      />

      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Logic Town"
        icon="🏙️"
        steps={[
          { emoji: '🎯', text: 'Goal: Place all 5 buildings. Rule: Each building must be on the ground or on top of another building.' },
          { emoji: '1️⃣', text: 'Step 1: Tap one building (house, school, hospital, etc.) to select it' },
          { emoji: '2️⃣', text: 'Step 2: Tap a GREEN spot to place it. Brown row = ground (build here first)' },
          { emoji: '🟢', text: 'Green = you can place there (ground or has a building below)' },
          { emoji: '🔴', text: 'Red = cannot place there yet (nothing below to support it)' },
          { emoji: '✅', text: 'Place all 5 buildings to complete the level!' },
        ]}
        tips={[
          'Always start from the brown ground row at the bottom.',
          'After that, you can build on top of buildings you already placed.',
          'Green = can place. Red = need support below first.',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
  },
  header: {
    backgroundColor: '#3949AB',
    padding: 14,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  objectiveBox: {
    backgroundColor: '#5C6BC0',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3949AB',
  },
  objectiveTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  objectiveText: {
    fontSize: 14,
    color: '#E8EAF6',
    lineHeight: 22,
  },
  objectiveBold: {
    fontWeight: 'bold',
    color: '#fff',
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
  stepLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3949AB',
    marginBottom: 10,
  },
  buildingsPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#7986CB',
  },
  buildingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  selectedHint: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 12,
  },
  legendText: {
    fontSize: 13,
    color: '#5C6BC0',
    fontWeight: '600',
  },
  gridContainer: {
    marginBottom: 20,
  },
  grid: {
    backgroundColor: '#C5CAE9',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3949AB',
    minHeight: 200,
  },
  gridCell: {
    width: `${100 / 5}%`,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#7986CB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    borderRadius: 6,
    margin: 2,
  },
  groundCell: {
    backgroundColor: '#8D6E63',
    borderColor: '#5D4037',
    borderWidth: 3,
  },
  availableCell: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  unavailableCell: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
    opacity: 0.5,
  },
  groundLabel: {
    fontSize: 20,
  },
  emptyLabel: {
    fontSize: 16,
    color: '#999',
  },
  buildingIcon: {
    fontSize: 30,
  },
  buildingButton: {
    width: 56,
    height: 56,
    backgroundColor: '#E8EAF6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderWidth: 2,
    borderColor: '#5C6BC0',
  },
  selectedBuildingButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  buildingButtonIcon: {
    fontSize: 35,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LogicTownGame;

