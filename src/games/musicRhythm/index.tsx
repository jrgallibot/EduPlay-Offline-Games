import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic, initializeAudio, loadSoundSetting } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty, scaleLevel } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

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
  const [showGuide, setShowGuide] = useState(true);
  const tilesRef = useRef<Tile[]>([]);
  const scoreRef = useRef(0);
  const hitsRef = useRef(0);

  const notes = ['🎵', '🎶', '🎼', '🎹'];

  useEffect(() => {
    loadProgress();
    generateSequence();
    loadSoundSetting();
    initializeAudio().then(() => {
      startBackgroundMusic();
    });
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('music');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
      scoreRef.current = progress.score;
    }
  };

  const generateSequence = () => {
    const effLevel = scaleLevel(level, getDifficulty());
    const sequenceLength = 5 + effLevel * 2;
    const newTiles: Tile[] = [];

    for (let i = 0; i < sequenceLength; i++) {
      newTiles.push({
        id: i,
        active: true,
        note: notes[Math.floor(Math.random() * notes.length)],
      });
    }

    tilesRef.current = newTiles;
    setTiles(newTiles);
    setCurrentTileIndex(0);
    setHits(0);
    setMisses(0);
    hitsRef.current = 0;
  };

  const startGame = async () => {
    await stopBackgroundMusic();
    setIsPlaying(true);
    playSequence();
  };

  const playSequence = () => {
    const sequence = tilesRef.current.length ? tilesRef.current : tiles;
    const effLevel = scaleLevel(level, getDifficulty());
    const speed = Math.max(500, getDifficulty() === 'easy' ? 1000 - effLevel * 30 : getDifficulty() === 'hard' ? 1000 - effLevel * 60 : 1000 - effLevel * 50);
    let index = 0;

    const playStep = () => {
      if (index >= sequence.length) {
        setIsPlaying(false);
        startBackgroundMusic();
        checkResults();
        return;
      }
      setCurrentTileIndex(index);
      playSoundEffect('click');
      index++;
      setTimeout(playStep, speed);
    };

    setTimeout(playStep, speed);
  };

  const tapTile = (tileId: number) => {
    if (!isPlaying) return;

    if (tileId === currentTileIndex) {
      playSoundEffect('correct');
      hitsRef.current += 1;
      scoreRef.current += 10;
      setHits((h) => h + 1);
      setScore((s) => s + 10);
    } else {
      playSoundEffect('wrong');
      setMisses((m) => m + 1);
    }
  };

  const checkResults = async () => {
    const totalTiles = tilesRef.current.length || tiles.length;
    const finalHits = hitsRef.current;
    const finalScore = scoreRef.current;
    const accuracy = totalTiles > 0 ? (finalHits / totalTiles) * 100 : 0;

    if (accuracy >= 70) {
      await playWinMusic();
      const newLevel = level + 1;
      await updateGameProgress('music', {
        level: newLevel,
        score: finalScore,
        stars: accuracy >= 90 ? 3 : accuracy >= 80 ? 2 : 1,
      });

      setScore(finalScore);
      setShowReward(true);
      setTimeout(() => {
        setShowReward(false);
        setLevel(newLevel);
        scoreRef.current = finalScore;
        generateSequence();
      }, 2000);
    } else {
      await playLoseMusic();
      Alert.alert(
        'Try Again!',
        `You hit ${finalHits}/${totalTiles} tiles. Aim for 70% or more!`,
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

      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>🎯 Your goal</Text>
        <Text style={styles.objectiveText}>
          <Text style={styles.objectiveBold}>Listen and tap in time.</Text> When you tap Start, tiles will light up one by one and you’ll hear a sound for each. Tap the tile that is lit (purple) to score. Hit 70% or more to pass the level!
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.gameContainer}>
          <Text style={styles.title}>🎵 Music Rhythm 🎵</Text>

          {!isPlaying ? (
            <View style={styles.startContainer}>
              <Text style={styles.instruction}>
                You’ll hear a sound each time a tile lights up. Tap that tile to score. Turn up your volume!
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.8}>
                <Text style={styles.startButtonText}>▶️ Start – listen & tap!</Text>
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
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tileNote}>{tile.note}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <RewardModal
        visible={showReward}
        rewardName="Rhythm Master!"
        rewardIcon="🎹"
        onClose={() => setShowReward(false)}
      />

      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Music Rhythm"
        icon="🎵"
        steps={[
          { emoji: '🎯', text: 'Goal: tap each tile when it lights up, in time with the sound' },
          { emoji: '🔊', text: 'Turn up your device volume – you’ll hear a sound for each step' },
          { emoji: '▶️', text: 'Tap "Start" – tiles will light up one by one with a sound' },
          { emoji: '👆', text: 'Tap the purple (lit) tile to score. Wrong tile = miss' },
          { emoji: '✅', text: 'Hit 70% or more of the tiles to pass the level!' },
        ]}
        tips={[
          'Listen first, then tap – the sound and highlight go together.',
          'Higher levels = faster rhythm. Stay calm and tap on the beat.',
          'No sound? Check device volume and that sound is enabled in app settings.',
        ]}
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
  objectiveBox: {
    backgroundColor: '#6A1B9A',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A148C',
  },
  objectiveTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  objectiveText: {
    fontSize: 14,
    color: '#E1BEE7',
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
    flexGrow: 1,
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: 320,
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

