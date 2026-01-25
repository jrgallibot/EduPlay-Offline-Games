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
        <Text style={styles.headerTitle}>Choose Your Adventure!</Text>
        <Text style={styles.headerSubtitle}>Pick a game to start learning</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
});

export default GameSelectScreen;

