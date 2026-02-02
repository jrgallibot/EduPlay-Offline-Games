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
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';

interface Mission {
  id: string;
  title: string;
  icon: string;
  description: string;
  points: number;
}

const missions: Mission[] = [
  {
    id: 'ocean',
    title: 'Clean the Ocean',
    icon: '🌊',
    description: 'Remove all the trash from the ocean!',
    points: 30,
  },
  {
    id: 'trees',
    title: 'Plant Trees',
    icon: '🌳',
    description: 'Plant 5 trees in the forest!',
    points: 25,
  },
  {
    id: 'animals',
    title: 'Save Animals',
    icon: '🐼',
    description: 'Help 3 animals find their homes!',
    points: 35,
  },
  {
    id: 'recycle',
    title: 'Recycle Waste',
    icon: '♻️',
    description: 'Sort waste into correct bins!',
    points: 20,
  },
];

const EcoGuardiansGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [missionProgress, setMissionProgress] = useState(0);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    loadProgress();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('eco');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
    }
  };

  const startMission = (mission: Mission) => {
    setCurrentMission(mission);
    setMissionProgress(0);
  };

  const doAction = () => {
    if (!currentMission) return;

    playSoundEffect('click');
    const diff = getDifficulty();
    const base = currentMission.id === 'trees' ? 5 : currentMission.id === 'animals' ? 3 : 10;
    const maxProgress = diff === 'easy' ? Math.max(2, base - 2) : diff === 'hard' ? base + 2 : base;
    const newProgress = missionProgress + 1;
    setMissionProgress(newProgress);

    if (newProgress >= maxProgress) {
      completeMission();
    }
  };

  const completeMission = async () => {
    if (!currentMission) return;

    playSoundEffect('win');
    const newScore = score + currentMission.points;
    setScore(newScore);

    if (!completedMissions.includes(currentMission.id)) {
      const newCompleted = [...completedMissions, currentMission.id];
      setCompletedMissions(newCompleted);

      if (newCompleted.length === missions.length) {
        await playWinMusic(); // Play victory music
        const newLevel = level + 1;
        await updateGameProgress('eco', {
          level: newLevel,
          score: newScore,
          stars: 3,
        });
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setLevel(newLevel);
          setCompletedMissions([]);
        }, 3000);
      }
    }

    setTimeout(() => setCurrentMission(null), 1500);
  };

  const getMissionActionText = () => {
    if (!currentMission) return '';
    if (currentMission.id === 'ocean') return '🗑️ Pick Up Trash';
    if (currentMission.id === 'trees') return '🌱 Plant Tree';
    if (currentMission.id === 'animals') return '🏡 Guide Animal';
    if (currentMission.id === 'recycle') return '♻️ Sort Waste';
    return 'Action';
  };

  const getMissionMaxProgress = () => {
    if (!currentMission) return 0;
    if (currentMission.id === 'trees') return 5;
    if (currentMission.id === 'animals') return 3;
    return 10;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Missions: {completedMissions.length}/{missions.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {!currentMission ? (
          <View style={styles.missionsContainer}>
            <Text style={styles.title}>🌍 Eco Guardian Missions 🌍</Text>
            <Text style={styles.subtitle}>Choose a mission to help the planet!</Text>

            {missions.map((mission) => {
              const isCompleted = completedMissions.includes(mission.id);
              return (
                <TouchableOpacity
                  key={mission.id}
                  style={[styles.missionCard, isCompleted && styles.completedCard]}
                  onPress={() => !isCompleted && startMission(mission)}
                >
                  <Text style={styles.missionIcon}>{mission.icon}</Text>
                  <View style={styles.missionInfo}>
                    <Text style={styles.missionTitle}>{mission.title}</Text>
                    <Text style={styles.missionDescription}>
                      {mission.description}
                    </Text>
                    <Text style={styles.missionPoints}>+{mission.points} points</Text>
                  </View>
                  {isCompleted && <Text style={styles.checkmark}>✅</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.missionActive}>
            <Text style={styles.activeMissionIcon}>{currentMission.icon}</Text>
            <Text style={styles.activeMissionTitle}>{currentMission.title}</Text>
            <Text style={styles.activeMissionDesc}>
              {currentMission.description}
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(missionProgress / getMissionMaxProgress()) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {missionProgress} / {getMissionMaxProgress()}
              </Text>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={doAction}>
              <Text style={styles.actionButtonText}>{getMissionActionText()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentMission(null)}
            >
              <Text style={styles.backButtonText}>← Back to Missions</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <RewardModal
        visible={showReward}
        rewardName="Eco Guardian Hero!"
        rewardIcon="🌍"
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
  scrollView: {
    flex: 1,
  },
  missionsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
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
  missionIcon: {
    fontSize: 50,
    marginRight: 15,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  missionPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkmark: {
    fontSize: 30,
  },
  missionActive: {
    padding: 20,
  },
  activeMissionIcon: {
    fontSize: 100,
    textAlign: 'center',
    marginBottom: 20,
  },
  activeMissionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  activeMissionDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 30,
    backgroundColor: '#DDD',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 25,
    borderRadius: 15,
    marginBottom: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 22,
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
});

export default EcoGuardiansGame;

