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
import { playSoundEffect, startBackgroundMusic, stopBackgroundMusic, playWinMusic, playLoseMusic } from '../../utils/sound';
import { getGameProgress, updateGameProgress } from '../../database/db';
import { RewardModal } from '../../components/RewardModal';

interface Country {
  code: string;
  name: string;
  flag: string;
  fact: string;
  capital: string;
  quiz: {
    question: string;
    options: string[];
    answer: string;
  };
}

const countries: Country[] = [
  {
    code: 'ph',
    name: 'Philippines',
    flag: '🇵🇭',
    fact: 'Has over 7,641 islands!',
    capital: 'Manila',
    quiz: {
      question: 'What is the capital of Philippines?',
      options: ['Manila', 'Cebu', 'Davao', 'Baguio'],
      answer: 'Manila',
    },
  },
  {
    code: 'us',
    name: 'United States',
    flag: '🇺🇸',
    fact: 'Home to the Grand Canyon!',
    capital: 'Washington D.C.',
    quiz: {
      question: 'What is famous in Arizona, USA?',
      options: ['Grand Canyon', 'Eiffel Tower', 'Big Ben', 'Taj Mahal'],
      answer: 'Grand Canyon',
    },
  },
  {
    code: 'jp',
    name: 'Japan',
    flag: '🇯🇵',
    fact: 'Land of the rising sun!',
    capital: 'Tokyo',
    quiz: {
      question: 'What is Japan called?',
      options: ['Land of Rising Sun', 'Land of Dragons', 'Land of Ice', 'Land of Eagles'],
      answer: 'Land of Rising Sun',
    },
  },
  {
    code: 'fr',
    name: 'France',
    flag: '🇫🇷',
    fact: 'Famous for the Eiffel Tower!',
    capital: 'Paris',
    quiz: {
      question: 'What famous landmark is in France?',
      options: ['Eiffel Tower', 'Big Ben', 'Colosseum', 'Statue of Liberty'],
      answer: 'Eiffel Tower',
    },
  },
  {
    code: 'eg',
    name: 'Egypt',
    flag: '🇪🇬',
    fact: 'Home to the ancient Pyramids!',
    capital: 'Cairo',
    quiz: {
      question: 'What ancient structure is in Egypt?',
      options: ['Pyramids', 'Great Wall', 'Taj Mahal', 'Colosseum'],
      answer: 'Pyramids',
    },
  },
];

const WorldExplorerGame: React.FC = () => {
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showReward, setShowReward] = useState(false);

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
    setShowQuiz(false);
    playSoundEffect('click');
  };

  const startQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizAnswer = async (answer: string) => {
    if (!currentCountry) return;

    if (answer === currentCountry.quiz.answer) {
      playSoundEffect('correct');
      const newScore = score + 20;
      setScore(newScore);

      if (!visitedCountries.includes(currentCountry.code)) {
        const newVisited = [...visitedCountries, currentCountry.code];
        setVisitedCountries(newVisited);

        if (newVisited.length === countries.length) {
          await playWinMusic(); // Play victory music
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

      Alert.alert('Correct! 🎉', `You earned a stamp from ${currentCountry.name}!`);
    } else {
      await playLoseMusic(); // Play failure music
      playSoundEffect('wrong');
      Alert.alert('Not quite!', 'Try another country!');
    }

    setCurrentCountry(null);
    setShowQuiz(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Level {level} | Score: {score} | Stamps: {visitedCountries.length}/{countries.length}
        </Text>
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
            ) : (
              <View style={styles.quizContainer}>
                <Text style={styles.quizQuestion}>{currentCountry.quiz.question}</Text>
                {currentCountry.quiz.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.quizOption}
                    onPress={() => handleQuizAnswer(option)}
                  >
                    <Text style={styles.quizOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <RewardModal
        visible={showReward}
        rewardName="World Explorer!"
        rewardIcon="🌍"
        onClose={() => setShowReward(false)}
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

