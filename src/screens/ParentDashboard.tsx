import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { useUserStore } from '../store/userStore';
import { getAllProgress, updateGameProgress, executeSQL, getSetting } from '../database/db';
import { GameProgress } from '../store/progressStore';
import { setMusicEnabled, getSoundEnabled } from '../utils/sound';

const ParentDashboard: React.FC = () => {
  const { user } = useUserStore();
  const [progressData, setProgressData] = useState<GameProgress[]>([]);
  const [totalPlaytime, setTotalPlaytime] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showScreenTimeModal, setShowScreenTimeModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [screenTimeLimit, setScreenTimeLimit] = useState(60); // minutes
  const [difficulty, setDifficulty] = useState('normal');
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    loadData();
    const saved = getSetting('sound_enabled');
    setSoundOn(saved !== '0');
    const diff = getSetting('difficulty');
    if (diff === 'easy' || diff === 'normal' || diff === 'hard') setDifficulty(diff);
  }, []);

  const loadData = async () => {
    const data = await getAllProgress();
    
    // Remove duplicates by keeping only the first occurrence of each game_key
    const uniqueData = data.reduce((acc: GameProgress[], game: GameProgress) => {
      const existing = acc.find((g) => g.game_key === game.game_key);
      if (!existing) {
        acc.push(game);
      }
      return acc;
    }, []);
    
    setProgressData(uniqueData);

    const playtime = uniqueData.reduce((sum, game) => sum + (game.playtime || 0), 0);
    const score = uniqueData.reduce((sum, game) => sum + (game.score || 0), 0);
    setTotalPlaytime(playtime);
    setTotalScore(score);
  };

  const formatPlaytime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleSetScreenTime = () => {
    if (screenTimeLimit < 15 || screenTimeLimit > 180) {
      Alert.alert('Invalid Time', 'Screen time must be between 15 and 180 minutes');
      return;
    }
    
    // Save to settings table
    executeSQL(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['screen_time_limit', screenTimeLimit.toString()]
    );
    
    Alert.alert('Success', `Screen time limit set to ${screenTimeLimit} minutes`);
    setShowScreenTimeModal(false);
  };

  const handleSetDifficulty = () => {
    // Save to settings table
    executeSQL(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['difficulty', difficulty]
    );
    
    Alert.alert('Success', `Difficulty set to ${difficulty}`);
    setShowDifficultyModal(false);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress?',
      'This will reset all game progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            // Reset all game progress
            for (const game of progressData) {
              await updateGameProgress(game.game_key, {
                level: 1,
                score: 0,
                completed: 0,
                stars: 0,
                playtime: 0,
              });
            }
            Alert.alert('Success', 'All progress has been reset');
            loadData();
          },
        },
      ]
    );
  };

  const handleExportReport = () => {
    const report = `
EduPlay Offline - Progress Report
Generated: ${new Date().toLocaleString()}

Player: ${user?.name || 'Unknown'}
Total Score: ${totalScore}
Total Playtime: ${formatPlaytime(totalPlaytime)}
Games Completed: ${progressData.filter((g) => g.completed).length}/15

Game Progress:
${progressData.map((game) => 
  `- ${gameNames[game.game_key] || game.game_key}: Level ${game.level}, Score: ${game.score}, Stars: ${'⭐'.repeat(game.stars)}`
).join('\n')}
    `.trim();
    
    Alert.alert('Progress Report', report, [{ text: 'OK' }]);
  };

  const gameNames: { [key: string]: string } = {
    math: 'Math Monsters',
    story: 'Story Builder',
    world: 'World Explorer',
    art: 'Art Detective',
    science: 'Science Lab',
    chef: 'Chef Fractions',
    code: 'Code Blocks',
    eco: 'Eco Guardians',
    music: 'Music Rhythm',
    logic: 'Logic Town',
    fruit: 'Fruit Finder',
    colorMatch: 'Color Match Parade',
    letterPop: 'Letter Pop Balloons',
    numberHop: 'Number Hop',
    animalSound: 'Animal Sound Match',
  };

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'web' && styles.containerWeb]}>
      <View style={[styles.scrollWrapper, Platform.OS === 'web' && styles.scrollWrapperWeb]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
        <View style={styles.header}>
          <Text style={styles.title}>Parent Dashboard</Text>
          {user && (
            <Text style={styles.subtitle}>Tracking progress for {user.name}</Text>
          )}
          <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalScore}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatPlaytime(totalPlaytime)}</Text>
            <Text style={styles.statLabel}>Playtime</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {progressData.filter((g) => g.completed).length}/15
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Progress</Text>
          {progressData.length === 0 ? (
            <Text style={styles.emptyText}>No progress data available</Text>
          ) : (
            progressData.map((game) => (
              <View key={`game-${game.game_key}-${game.id}`} style={styles.gameProgress}>
                <View style={styles.gameHeader}>
                  <Text style={styles.gameName}>
                    {gameNames[game.game_key] || game.game_key}
                  </Text>
                  <Text style={styles.gameLevel}>Level {game.level}</Text>
                </View>
                <ProgressBar
                  progress={game.completed ? 1 : game.level / 10}
                  showPercentage={false}
                />
                <View style={styles.gameStats}>
                  <Text style={styles.gameStatText}>
                    Score: {game.score} | Stars: {'⭐'.repeat(game.stars)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity 
            style={styles.settingButton} 
            onPress={() => setShowScreenTimeModal(true)}
          >
            <Text style={styles.settingText}>🔒 Set Screen Time Limit</Text>
            <Text style={styles.settingSubtext}>{screenTimeLimit} minutes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => setShowDifficultyModal(true)}
          >
            <Text style={styles.settingText}>🎯 Adjust Difficulty</Text>
            <Text style={styles.settingSubtext}>Current: {difficulty}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => {
              const next = !soundOn;
              setSoundOn(next);
              setMusicEnabled(next);
            }}
          >
            <Text style={styles.settingText}>🔊 Game Sounds</Text>
            <Text style={styles.settingSubtext}>{soundOn ? 'On – playful ringtone in games' : 'Off'} – tap to toggle</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={handleExportReport}
          >
            <Text style={styles.settingText}>📊 Export Report</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingButton, styles.dangerButton]}
            onPress={handleResetProgress}
          >
            <Text style={[styles.settingText, styles.dangerText]}>🗑️ Reset All Progress</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </View>

      {/* Screen Time Modal */}
      <Modal
        visible={showScreenTimeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScreenTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Screen Time Limit</Text>
            <Text style={styles.modalSubtitle}>Enter time in minutes (15-180)</Text>
            <TextInput
              style={styles.modalInput}
              value={screenTimeLimit.toString()}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (!isNaN(num)) setScreenTimeLimit(num);
              }}
              keyboardType="number-pad"
              placeholder="60"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowScreenTimeModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSetScreenTime}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Difficulty Modal */}
      <Modal
        visible={showDifficultyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDifficultyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adjust Difficulty</Text>
            <View style={styles.difficultyOptions}>
              {['easy', 'normal', 'hard'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyOption,
                    difficulty === diff && styles.difficultyOptionSelected,
                  ]}
                  onPress={() => setDifficulty(diff)}
                >
                  <Text
                    style={[
                      styles.difficultyOptionText,
                      difficulty === diff && styles.difficultyOptionTextSelected,
                    ]}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDifficultyModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSetDifficulty}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerWeb: {
    minHeight: 0,
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollWrapperWeb: {
    minHeight: 0,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  refreshButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    width: '30%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  gameProgress: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gameLevel: {
    fontSize: 14,
    color: '#666',
  },
  gameStats: {
    marginTop: 5,
  },
  gameStatText: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
  },
  settingButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  settingSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  dangerButton: {
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  dangerText: {
    color: '#FF5722',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  difficultyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  difficultyOption: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    minWidth: 80,
  },
  difficultyOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  difficultyOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  difficultyOptionTextSelected: {
    color: '#fff',
  },
});

export default ParentDashboard;
