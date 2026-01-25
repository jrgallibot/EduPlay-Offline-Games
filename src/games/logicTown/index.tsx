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
  const [availableBuildings, setAvailableBuildings] = useState<string[]>([
    '🏠',
    '🏢',
    '🏪',
    '🏫',
    '🏥',
  ]);
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
    setAvailableBuildings(['🏠', '🏢', '🏪', '🏫', '🏥']);
    setSelectedBuilding(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.gameContainer}>
          <Text style={styles.title}>🏙️ Logic Town Builder 🏙️</Text>
          <Text style={styles.instruction}>
            Build your town! Buildings need support below them.
          </Text>

          <View style={styles.gridContainer}>
            <Text style={styles.gridHint}>
              💡 Tap a building below, then tap a green spot to place it!
            </Text>
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

          <View style={styles.buildingsPanel}>
            <Text style={styles.panelTitle}>Available Buildings:</Text>
            <View style={styles.buildingsContainer}>
              {availableBuildings.length === 0 ? (
                <Text style={styles.emptyText}>All buildings placed!</Text>
              ) : (
                availableBuildings.map((building, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.buildingButton,
                      selectedBuilding === building && styles.selectedBuildingButton,
                    ]}
                    onPress={() => selectBuilding(building)}
                  >
                    <Text style={styles.buildingButtonIcon}>{building}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetTown}>
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
        title="Logic Town Builder"
        icon="🏙️"
        steps={[
          {
            emoji: '👆',
            text: 'Tap a building from the bottom (house, school, hospital, etc.)',
          },
          {
            emoji: '🌍',
            text: 'Find the brown row at the bottom - this is the ground!',
          },
          {
            emoji: '🟢',
            text: 'Tap a GREEN spot to place your building',
          },
          {
            emoji: '🔴',
            text: 'RED spots mean you cannot build there - need support below!',
          },
          {
            emoji: '🏗️',
            text: 'Place all 5 buildings to complete the level!',
          },
        ]}
        tips={[
          'Always start from the brown ground row!',
          'Buildings need something below them to stand',
          'Green = Good place, Red = Cannot build',
          'Have fun building your town!',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  header: {
    backgroundColor: '#2196F3',
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
  scrollContent: {
    paddingBottom: 20,
  },
  gameContainer: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  gridContainer: {
    marginBottom: 20,
  },
  grid: {
    backgroundColor: '#BBDEFB',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#2196F3',
    minHeight: 200,
  },
  gridCell: {
    width: `${100 / 5}%`,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#64B5F6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 5,
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
  gridHint: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  buildingIcon: {
    fontSize: 30,
  },
  buildingsPanel: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buildingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buildingButton: {
    width: 60,
    height: 60,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 2,
    borderColor: '#2196F3',
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

