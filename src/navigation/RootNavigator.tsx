import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import GameSelectScreen from '../screens/GameSelectScreen';
import ParentDashboard from '../screens/ParentDashboard';
import MathMonstersGame from '../games/mathMonsters';
import StoryBuilderGame from '../games/storyBuilder';
import WorldExplorerGame from '../games/worldExplorer';
import ArtDetectiveGame from '../games/artDetective';
import ScienceLabGame from '../games/scienceLab';
import ChefFractionsGame from '../games/chefFractions';
import CodeBlocksGame from '../games/codeBlocks';
import EcoGuardiansGame from '../games/ecoGuardians';
import MusicRhythmGame from '../games/musicRhythm';
import LogicTownGame from '../games/logicTown';
import FruitFinderGame from '../games/fruitFinder';

export type RootStackParamList = {
  Home: undefined;
  GameSelect: undefined;
  ParentDashboard: undefined;
  MathMonsters: undefined;
  StoryBuilder: undefined;
  WorldExplorer: undefined;
  ArtDetective: undefined;
  ScienceLab: undefined;
  ChefFractions: undefined;
  CodeBlocks: undefined;
  EcoGuardians: undefined;
  MusicRhythm: undefined;
  LogicTown: undefined;
  FruitFinder: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GameSelect"
        component={GameSelectScreen}
        options={{ title: 'Choose Your Game' }}
      />
      <Stack.Screen
        name="ParentDashboard"
        component={ParentDashboard}
        options={{ title: 'Parent Dashboard' }}
      />
      <Stack.Screen
        name="MathMonsters"
        component={MathMonstersGame}
        options={{ title: 'Math Monsters Arena' }}
      />
      <Stack.Screen
        name="StoryBuilder"
        component={StoryBuilderGame}
        options={{ title: 'Story Builder Kids' }}
      />
      <Stack.Screen
        name="WorldExplorer"
        component={WorldExplorerGame}
        options={{ title: 'World Explorer' }}
      />
      <Stack.Screen
        name="ArtDetective"
        component={ArtDetectiveGame}
        options={{ title: 'Art Detective' }}
      />
      <Stack.Screen
        name="ScienceLab"
        component={ScienceLabGame}
        options={{ title: 'Science Tap Lab' }}
      />
      <Stack.Screen
        name="ChefFractions"
        component={ChefFractionsGame}
        options={{ title: 'Chef Fractions' }}
      />
      <Stack.Screen
        name="CodeBlocks"
        component={CodeBlocksGame}
        options={{ title: 'Code Blocks Junior' }}
      />
      <Stack.Screen
        name="EcoGuardians"
        component={EcoGuardiansGame}
        options={{ title: 'Eco Guardians' }}
      />
      <Stack.Screen
        name="MusicRhythm"
        component={MusicRhythmGame}
        options={{ title: 'Music Rhythm Tiles' }}
      />
      <Stack.Screen
        name="LogicTown"
        component={LogicTownGame}
        options={{ title: 'Logic Town Builder' }}
      />
      <Stack.Screen
        name="FruitFinder"
        component={FruitFinderGame}
        options={{ title: 'Fruit Finder' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;

