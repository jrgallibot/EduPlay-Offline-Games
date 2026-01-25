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
import { RewardModal } from '../../components/RewardModal';

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

    if (newCount % 3 === 0) {
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
    
    await updateGameProgress('story', {
      level: newLevel,
      score: currentScore,
      stars: Math.min(3, Math.floor(storiesCreated / 3)),
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Stories: {storiesCreated}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.storyDisplay}>
          <Text style={styles.storyTitle}>Your Story:</Text>
          <View style={styles.storyContainer}>
            <Text style={styles.storyText}>
              {selectedSubject || '[Subject]'}{' '}
              {selectedVerb || '[Verb]'}{' '}
              {selectedObject || '[Object]'}{' '}
              {selectedPlace || '[Place]'}.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1️⃣ Choose Subject (Who?):</Text>
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
          <Text style={styles.sectionTitle}>2️⃣ Choose Verb (Did what?):</Text>
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
          <Text style={styles.sectionTitle}>3️⃣ Choose Object (What?):</Text>
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
          <Text style={styles.sectionTitle}>4️⃣ Choose Place (Where?):</Text>
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

        <TouchableOpacity style={styles.createButton} onPress={createStory}>
          <Text style={styles.createButtonText}>📖 Create Story!</Text>
        </TouchableOpacity>
      </ScrollView>

      <RewardModal
        visible={showReward}
        rewardName="Story Master!"
        rewardIcon="📚"
        onClose={() => setShowReward(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  header: {
    backgroundColor: '#FF6B6B',
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
  storyDisplay: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  storyContainer: {
    padding: 15,
    backgroundColor: '#FFF8DC',
    borderRadius: 10,
  },
  storyText: {
    fontSize: 20,
    color: '#333',
    lineHeight: 30,
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: '#DDD',
  },
  selectedWord: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wordText: {
    fontSize: 14,
    color: '#333',
  },
  selectedWordText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    margin: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default StoryBuilderGame;

