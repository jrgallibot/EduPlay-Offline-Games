import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { GameCard } from '../components/GameCard';
import { useProgressStore } from '../store/progressStore';
import { getAllProgress } from '../database/db';

type GameSelectScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GameSelect'
>;

interface Props {
  navigation: GameSelectScreenNavigationProp;
}

const games = [
  { key: 'math', title: 'Math Monsters', icon: '👾', screen: 'MathMonsters' },
  { key: 'story', title: 'Story Builder', icon: '📚', screen: 'StoryBuilder' },
  { key: 'world', title: 'World Explorer', icon: '🌍', screen: 'WorldExplorer' },
  { key: 'art', title: 'Art Detective', icon: '🎨', screen: 'ArtDetective' },
  { key: 'science', title: 'Science Lab', icon: '🧪', screen: 'ScienceLab' },
  { key: 'chef', title: 'Chef Fractions', icon: '🍕', screen: 'ChefFractions' },
  { key: 'code', title: 'Code Blocks', icon: '🚀', screen: 'CodeBlocks' },
  { key: 'eco', title: 'Eco Guardians', icon: '🌱', screen: 'EcoGuardians' },
  { key: 'music', title: 'Music Rhythm', icon: '🎵', screen: 'MusicRhythm' },
  { key: 'logic', title: 'Logic Town', icon: '🧩', screen: 'LogicTown' },
  { key: 'fruit', title: 'Fruit Finder', icon: '🍎', screen: 'FruitFinder' },
  { key: 'colorMatch', title: 'Color Match Parade', icon: '🌈', screen: 'ColorMatchParade' },
  { key: 'letterPop', title: 'Letter Pop Balloons', icon: '🎈', screen: 'LetterPopBalloons' },
  { key: 'numberHop', title: 'Number Hop', icon: '🐸', screen: 'NumberHop' },
  { key: 'animalSound', title: 'Animal Sound Match', icon: '🐾', screen: 'AnimalSoundMatch' },
];

const GameSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { progress, loadProgress } = useProgressStore();

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    const allProgress = await getAllProgress();
    loadProgress(allProgress);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎮</Text>
        <Text style={styles.headerTitle}>Choose Your Game!</Text>
        <Text style={styles.headerSubtitle}>Tap any game to play • {games.length} fun games</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{games.length} Games</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>All games</Text>
        <View style={styles.gamesGrid}>
          {games.map((game) => {
            const gameProgress = progress[game.key] || {
              level: 1,
              stars: 0,
            };
            return (
              <GameCard
                key={game.key}
                title={game.title}
                icon={game.icon}
                level={gameProgress.level}
                stars={gameProgress.stars}
                onPress={() =>
                  navigation.navigate(game.screen as keyof RootStackParamList)
                }
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#C8E6C9',
    textAlign: 'center',
    marginTop: 6,
  },
  badge: {
    marginTop: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 14,
    marginLeft: 4,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default GameSelectScreen;

