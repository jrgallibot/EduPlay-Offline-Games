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
import { shuffle } from '../../utils/math';
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

interface StoryParts {
  subjects: string[];
  verbs: string[];
  objects: string[];
  places: string[];
}

const storyParts: StoryParts = {
  subjects: ['A brave knight', 'A clever fox', 'The princess', 'A friendly dragon', 'The wizard'],
  verbs: ['discovered', 'built', 'visited', 'created', 'found'],
  objects: ['a magic wand', 'a treasure chest', 'a secret map', 'a golden crown', 'a flying carpet'],
  places: ['in the castle', 'under the sea', 'in the forest', 'on the moon', 'in a cave'],
};

const StoryBuilderGame: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedVerb, setSelectedVerb] = useState('');
  const [selectedObject, setSelectedObject] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [storiesCreated, setStoriesCreated] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [shuffledParts, setShuffledParts] = useState<StoryParts>({
    subjects: [],
    verbs: [],
    objects: [],
    places: [],
  });
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    loadProgress();
    shuffleWords();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('story');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
    }
  };

  const shuffleWords = () => {
    setShuffledParts({
      subjects: shuffle(storyParts.subjects),
      verbs: shuffle(storyParts.verbs),
      objects: shuffle(storyParts.objects),
      places: shuffle(storyParts.places),
    });
  };

  const createStory = () => {
    if (!selectedSubject || !selectedVerb || !selectedObject || !selectedPlace) {
      Alert.alert('Incomplete Story', 'Please select words for all parts!');
      return;
    }

    playSoundEffect('win');
    const newScore = score + 50;
    const newCount = storiesCreated + 1;

    setScore(newScore);
    setStoriesCreated(newCount);

    const storiesNeeded = getDifficulty() === 'easy' ? 2 : getDifficulty() === 'hard' ? 4 : 3;
    if (newCount % storiesNeeded === 0) {
      handleLevelComplete();
    } else {
      Alert.alert(
        '🎉 Story Created!',
        `${selectedSubject} ${selectedVerb} ${selectedObject} ${selectedPlace}.\n\nGreat job!`,
        [{ text: 'Create Another', onPress: resetStory }]
      );
    }
  };

  const handleLevelComplete = async () => {
    await playWinMusic(); // Play victory music
    const newLevel = level + 1;
    const currentScore = score; // Use current score state
    const storiesNeeded = getDifficulty() === 'easy' ? 2 : getDifficulty() === 'hard' ? 4 : 3;
    await updateGameProgress('story', {
      level: newLevel,
      score: currentScore,
      stars: Math.min(3, Math.floor(storiesCreated / storiesNeeded)),
    });

    setShowReward(true);
    setTimeout(() => {
      setShowReward(false);
      setLevel(newLevel);
      resetStory();
    }, 3000);
  };

  const resetStory = () => {
    setSelectedSubject('');
    setSelectedVerb('');
    setSelectedObject('');
    setSelectedPlace('');
    shuffleWords();
  };

  const renderWordButton = (
    word: string,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={word}
      style={[styles.wordButton, isSelected && styles.selectedWord]}
      onPress={onPress}
    >
      <Text style={[styles.wordText, isSelected && styles.selectedWordText]}>
        {word}
      </Text>
    </TouchableOpacity>
  );

  const canCreate = Boolean(selectedSubject && selectedVerb && selectedObject && selectedPlace);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Stories: {storiesCreated}
        </Text>
      </View>

      <View style={styles.objectiveBox}>
        <Text style={styles.objectiveTitle}>📖 Your goal</Text>
        <Text style={styles.objectiveText}>
          Pick <Text style={styles.objectiveBold}>one word from each section</Text> below (Who? What did they do? What? Where?), then tap <Text style={styles.objectiveBold}>Create Story!</Text> at the bottom.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.storyDisplay}>
          <Text style={styles.storyTitle}>Your story so far:</Text>
          <View style={styles.storyContainer}>
            <Text style={styles.storyText}>
              {selectedSubject || '[Who?]'}{' '}
              {selectedVerb || '[Did what?]'}{' '}
              {selectedObject || '[What?]'}{' '}
              {selectedPlace || '[Where?]'}.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1️⃣ Who? (Subject)</Text>
          <View style={styles.wordsContainer}>
            {shuffledParts.subjects.map((word) =>
              renderWordButton(
                word,
                selectedSubject === word,
                () => setSelectedSubject(word)
              )
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2️⃣ Did what? (Verb)</Text>
          <View style={styles.wordsContainer}>
            {shuffledParts.verbs.map((word) =>
              renderWordButton(
                word,
                selectedVerb === word,
                () => setSelectedVerb(word)
              )
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3️⃣ What? (Object)</Text>
          <View style={styles.wordsContainer}>
            {shuffledParts.objects.map((word) =>
              renderWordButton(
                word,
                selectedObject === word,
                () => setSelectedObject(word)
              )
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4️⃣ Where? (Place)</Text>
          <View style={styles.wordsContainer}>
            {shuffledParts.places.map((word) =>
              renderWordButton(
                word,
                selectedPlace === word,
                () => setSelectedPlace(word)
              )
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, !canCreate && styles.createButtonDimmed]}
          onPress={createStory}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Create Story"
        >
          <Text style={styles.createButtonText}>📖 Create Story!</Text>
          {!canCreate && (
            <Text style={styles.createButtonHint}>Pick one word from each section above first</Text>
          )}
        </TouchableOpacity>
      </View>

      <RewardModal
        visible={showReward}
        rewardName="Story Master!"
        rewardIcon="📚"
        onClose={() => setShowReward(false)}
      />

      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="Story Builder"
        icon="📖"
        steps={[
          { emoji: '🎯', text: 'Your goal: pick one word from each section (Who? Did what? What? Where?)' },
          { emoji: '👤', text: 'Who? Tap one subject (knight, princess, dragon...)' },
          { emoji: '🏃', text: 'Did what? Tap one verb (discovered, built, visited...)' },
          { emoji: '🎁', text: 'What? Tap one object (magic wand, treasure, crown...)' },
          { emoji: '📍', text: 'Where? Tap one place (castle, forest, moon...)' },
          { emoji: '✅', text: 'Tap the green "Create Story!" button at the bottom to finish!' },
        ]}
        tips={[
          'The Create Story button is always at the bottom of the screen.',
          'Any choices are OK – there are no wrong answers!',
          'Create 3 stories to level up. Have fun!',
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E6',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 14,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  objectiveBox: {
    backgroundColor: '#D2691E',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A0522D',
  },
  objectiveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  objectiveText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
  objectiveBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  storyDisplay: {
    padding: 18,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  storyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  storyContainer: {
    padding: 14,
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
  },
  storyText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4E37',
    marginBottom: 10,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#CCC',
    minHeight: 44,
    justifyContent: 'center',
  },
  selectedWord: {
    backgroundColor: '#228B22',
    borderColor: '#228B22',
  },
  wordText: {
    fontSize: 15,
    color: '#333',
  },
  selectedWordText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#F5F0E6',
    borderTopWidth: 2,
    borderTopColor: '#8B4513',
  },
  createButton: {
    backgroundColor: '#228B22',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  createButtonDimmed: {
    opacity: 0.85,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButtonHint: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
});

export default StoryBuilderGame;

