import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic, cleanupAudio } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { getDifficulty } from '../../utils/difficulty';
import { RewardModal } from '../../components/RewardModal';
import { GameGuide } from '../../components/GameGuide';

interface QuizItem {
  question: string;
  options: string[];
  answer: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  fact: string;
  capital: string;
  quizzes: QuizItem[];
}

const countries: Country[] = [
  {
    code: 'ph',
    name: 'Philippines',
    flag: '🇵🇭',
    fact: 'Has over 7,641 islands!',
    capital: 'Manila',
    quizzes: [
      { question: 'What is the capital of Philippines?', options: ['Manila', 'Cebu', 'Davao', 'Baguio'], answer: 'Manila' },
      { question: 'How many islands does Philippines have?', options: ['Over 7,000', 'About 100', 'About 50', 'Over 10,000'], answer: 'Over 7,000' },
      { question: 'Which sea is west of the Philippines?', options: ['South China Sea', 'Atlantic Ocean', 'Mediterranean', 'Baltic Sea'], answer: 'South China Sea' },
      { question: 'What fruit is the Philippines known for?', options: ['Mango', 'Apple', 'Banana only', 'Grapes'], answer: 'Mango' },
    ],
  },
  {
    code: 'us',
    name: 'United States',
    flag: '🇺🇸',
    fact: 'Home to the Grand Canyon!',
    capital: 'Washington D.C.',
    quizzes: [
      { question: 'What big canyon is in the USA?', options: ['Grand Canyon', 'Eiffel Tower', 'Big Ben', 'Taj Mahal'], answer: 'Grand Canyon' },
      { question: 'Where is the Grand Canyon?', options: ['Arizona', 'France', 'Japan', 'Egypt'], answer: 'Arizona' },
      { question: 'What is the capital of the United States?', options: ['Washington D.C.', 'New York', 'Los Angeles', 'Chicago'], answer: 'Washington D.C.' },
      { question: 'How many states does the USA have?', options: ['50', '48', '52', '45'], answer: '50' },
    ],
  },
  {
    code: 'jp',
    name: 'Japan',
    flag: '🇯🇵',
    fact: 'Land of the rising sun!',
    capital: 'Tokyo',
    quizzes: [
      { question: 'What is Japan sometimes called?', options: ['Land of Rising Sun', 'Land of Dragons', 'Land of Ice', 'Land of Eagles'], answer: 'Land of Rising Sun' },
      { question: 'What is the capital of Japan?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima'], answer: 'Tokyo' },
      { question: 'What is a famous Japanese mountain?', options: ['Mount Fuji', 'Mount Everest', 'K2', 'Kilimanjaro'], answer: 'Mount Fuji' },
      { question: 'What do many Japanese people eat with chopsticks?', options: ['Rice', 'Pizza only', 'Bread only', 'Soup only'], answer: 'Rice' },
    ],
  },
  {
    code: 'fr',
    name: 'France',
    flag: '🇫🇷',
    fact: 'Famous for the Eiffel Tower!',
    capital: 'Paris',
    quizzes: [
      { question: 'What tall tower is in France?', options: ['Eiffel Tower', 'Big Ben', 'Colosseum', 'Statue of Liberty'], answer: 'Eiffel Tower' },
      { question: 'What is the capital of France?', options: ['Paris', 'Lyon', 'Nice', 'Marseille'], answer: 'Paris' },
      { question: 'What language do people speak in France?', options: ['French', 'Spanish', 'German', 'Italian'], answer: 'French' },
      { question: 'What famous art museum is in Paris?', options: ['The Louvre', 'The Met', 'British Museum', 'Uffizi'], answer: 'The Louvre' },
    ],
  },
  {
    code: 'eg',
    name: 'Egypt',
    flag: '🇪🇬',
    fact: 'Home to the ancient Pyramids!',
    capital: 'Cairo',
    quizzes: [
      { question: 'What big triangles are in Egypt?', options: ['Pyramids', 'Great Wall', 'Taj Mahal', 'Colosseum'], answer: 'Pyramids' },
      { question: 'What is the capital of Egypt?', options: ['Cairo', 'Alexandria', 'Luxor', 'Aswan'], answer: 'Cairo' },
      { question: 'What river flows through Egypt?', options: ['Nile', 'Amazon', 'Mississippi', 'Thames'], answer: 'Nile' },
      { question: 'What is the Great Sphinx?', options: ['A statue with a lion body', 'A pyramid', 'A temple', 'A river'], answer: 'A statue with a lion body' },
    ],
  },
];

const WorldExplorerGame: React.FC = () => {
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showReward, setShowReward] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  useFocusEffect(
    useCallback(() => {
      return () => {
        cleanupAudio();
      };
    }, [])
  );

  useEffect(() => {
    loadProgress();
    startBackgroundMusic(); // Start intense background music
    
    return () => {
      stopBackgroundMusic(); // Stop music when leaving game
    };
  }, []);

  const loadProgress = async () => {
    const progress = await getGameProgress('world');
    if (progress) {
      setLevel(progress.level);
      setScore(progress.score);
    }
  };

  const visitCountry = (country: Country) => {
    setCurrentCountry(country);
    setCurrentQuiz(null);
    setShowQuiz(false);
    playSoundEffect('click');
  };

  const startQuiz = () => {
    if (!currentCountry) return;
    const quizzes = currentCountry.quizzes;
    const diff = getDifficulty();
    const maxQuizzes = diff === 'easy' ? 2 : quizzes.length;
    const quizIndex = (level - 1) % Math.min(maxQuizzes, quizzes.length);
    const quiz = quizzes[quizIndex];
    setCurrentQuiz(quiz);
    setShowQuiz(true);
  };

  const handleQuizAnswer = async (answer: string) => {
    if (!currentCountry || !currentQuiz) return;

    if (answer === currentQuiz.answer) {
      playSoundEffect('correct');
      const newScore = score + 20;
      setScore(newScore);

      if (!visitedCountries.includes(currentCountry.code)) {
        const newVisited = [...visitedCountries, currentCountry.code];
        setVisitedCountries(newVisited);

        if (newVisited.length === countries.length) {
          await playWinMusic();
          const newLevel = level + 1;
          await updateGameProgress('world', {
            level: newLevel,
            score: newScore,
            stars: 3,
          });
          setShowReward(true);
          setTimeout(() => {
            setShowReward(false);
            setLevel(newLevel);
            setVisitedCountries([]);
          }, 3000);
        }
      }

      setTimeout(() => {
        setCurrentCountry(null);
        setCurrentQuiz(null);
        setShowQuiz(false);
      }, 1200);
    } else {
      await playLoseMusic();
      playSoundEffect('wrong');
      Alert.alert('Not quite!', 'Try another country!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Stamps: {visitedCountries.length}/{countries.length}
        </Text>
        <Text style={styles.headerSubtext}>Tap a country → Answer the question → Get a stamp! Visit all to level up.</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {!currentCountry ? (
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>🌍 Explore the World! 🌍</Text>
            <Text style={styles.mapSubtitle}>Tap a country to visit</Text>

            <View style={styles.countriesGrid}>
              {countries.map((country) => {
                const isVisited = visitedCountries.includes(country.code);
                return (
                  <TouchableOpacity
                    key={country.code}
                    style={[styles.countryCard, isVisited && styles.visitedCard]}
                    onPress={() => visitCountry(country)}
                  >
                    <Text style={styles.flag}>{country.flag}</Text>
                    <Text style={styles.countryName}>{country.name}</Text>
                    {isVisited && <Text style={styles.stamp}>✅</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.countryDetail}>
            <Text style={styles.detailFlag}>{currentCountry.flag}</Text>
            <Text style={styles.detailName}>{currentCountry.name}</Text>
            <View style={styles.factBox}>
              <Text style={styles.factLabel}>Did you know?</Text>
              <Text style={styles.factText}>{currentCountry.fact}</Text>
              <Text style={styles.capitalText}>Capital: {currentCountry.capital}</Text>
            </View>

            {!showQuiz ? (
              <View>
                <TouchableOpacity style={styles.quizButton} onPress={startQuiz}>
                  <Text style={styles.quizButtonText}>Take Quiz to Earn Stamp! 🏆</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentCountry(null)}
                >
                  <Text style={styles.backButtonText}>← Back to Map</Text>
                </TouchableOpacity>
              </View>
            ) : currentQuiz ? (
              <View style={styles.quizContainer}>
                <Text style={styles.quizQuestion}>{currentQuiz.question}</Text>
                {shuffle([...currentQuiz.options]).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.quizOption}
                    onPress={() => handleQuizAnswer(option)}
                  >
                    <Text style={styles.quizOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <RewardModal
        visible={showReward}
        rewardName="World Explorer!"
        rewardIcon="🌍"
        onClose={() => setShowReward(false)}
      />

      <GameGuide
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        title="World Explorer"
        icon="🌍"
        steps={[
          { emoji: '🗺️', text: 'Tap a country to visit it' },
          { emoji: '📖', text: 'Read the fun fact about that country' },
          { emoji: '❓', text: 'Tap "Take Quiz" to answer a question' },
          { emoji: '✅', text: 'Get the answer right to earn a stamp!' },
          { emoji: '🎯', text: 'Visit all countries and pass their quizzes to level up' },
        ]}
        tips={[
          'Questions change each time – try again if you miss!',
          'Read the fact first – the answer is often there.',
          'Have fun learning about the world!',
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
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    padding: 20,
  },
  mapTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  mapSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  countryCard: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#DDD',
  },
  visitedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  flag: {
    fontSize: 50,
    marginBottom: 10,
  },
  countryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  stamp: {
    fontSize: 30,
    marginTop: 10,
  },
  countryDetail: {
    padding: 20,
  },
  detailFlag: {
    fontSize: 100,
    textAlign: 'center',
    marginBottom: 10,
  },
  detailName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  factBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  factLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  factText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  capitalText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  quizButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 18,
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
  quizContainer: {
    marginTop: 20,
  },
  quizQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  quizOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  quizOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default WorldExplorerGame;

