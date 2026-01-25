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
import { RewardModal } from '../../components/RewardModal';

interface Tile {
  id: number;
  active: boolean;
  note: string;
}

const MusicRhythmGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTileIndex, setCurrentTileIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [showReward, setShowReward] = useState(false);

  const notes = ['🎵', '🎶', '🎼', '🎹'];

  useEffect(() => {
    loadProgress();
    generateSequence();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('music');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
    }
  };

  const generateSequence = () => {
    const sequenceLength = 5 + level * 2;
    const newTiles: Tile[] = [];

    for (let i = 0; i < sequenceLength; i++) {
      newTiles.push({
        id: i,
        active: true,
        note: notes[Math.floor(Math.random() * notes.length)],
      });
    }

    setTiles(newTiles);
    setCurrentTileIndex(0);
    setHits(0);
    setMisses(0);
  };

  const startGame = () => {
    setIsPlaying(true);
    playSequence();
  };

  const playSequence = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= tiles.length) {
        clearInterval(interval);
        setIsPlaying(false);
        checkResults();
        return;
      }

      setCurrentTileIndex(index);
      index++;
    }, 1000 - level * 50);
  };

  const tapTile = (tileId: number) => {
    if (!isPlaying) return;

    if (tileId === currentTileIndex) {
      playSoundEffect('correct');
      setHits(hits + 1);
      setScore(score + 10);
    } else {
      playSoundEffect('wrong');
      setMisses(misses + 1);
    }
  };

  const checkResults = async () => {
    const accuracy = (hits / tiles.length) * 100;
    const currentScore = score; // Use current score state

    if (accuracy >= 70) {
      await playWinMusic(); // Play victory music
      const newLevel = level + 1;
      await updateGameProgress('music', {
        level: newLevel,
        score: currentScore,
        stars: accuracy >= 90 ? 3 : accuracy >= 80 ? 2 : 1,
      });

      setShowReward(true);
      setTimeout(() => {
        setShowReward(false);
        setLevel(newLevel);
        generateSequence();
      }, 2000);
    } else {
      await playLoseMusic(); // Play failure music
      Alert.alert(
        'Try Again!',
        `You hit ${hits}/${tiles.length} tiles. Keep practicing!`,
        [{ text: 'Retry', onPress: generateSequence }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Hits: {hits} | Misses: {misses}
        </Text>
      </View>

      <View style={styles.gameContainer}>
        <Text style={styles.title}>🎵 Music Rhythm Tiles 🎵</Text>

        {!isPlaying ? (
          <View style={styles.startContainer}>
            <Text style={styles.instruction}>
              Tap the tiles as they light up in rhythm!
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>▶️ Start Playing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tilesContainer}>
            {tiles.map((tile, index) => {
              const isActive = index === currentTileIndex;
              return (
                <TouchableOpacity
                  key={tile.id}
                  style={[styles.tile, isActive && styles.activeTile]}
                  onPress={() => tapTile(tile.id)}
                >
                  <Text style={styles.tileNote}>{tile.note}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <RewardModal
        visible={showReward}
        rewardName="Rhythm Master!"
        rewardIcon="🎹"
        onClose={() => setShowReward(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    backgroundColor: '#9C27B0',
    padding: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  startContainer: {
    alignItems: 'center',
  },
  instruction: {
    fontSize: 18,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tile: {
    width: 100,
    height: 100,
    backgroundColor: '#16213E',
    borderRadius: 15,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333',
  },
  activeTile: {
    backgroundColor: '#9C27B0',
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  tileNote: {
    fontSize: 40,
  },
});

export default MusicRhythmGame;

