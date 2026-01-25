import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useUserStore } from '../store/userStore';
import { getUser, createUser } from '../database/db';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useUserStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const existingUser = await getUser();
    if (existingUser) {
      setUser(existingUser);
    } else {
      setShowSetup(true);
    }
  };

  const handleCreateUser = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!age || parseInt(age) < 3 || parseInt(age) > 12) {
      Alert.alert('Error', 'Please enter age between 3 and 12');
      return;
    }

    await createUser(name, parseInt(age));
    const newUser = await getUser();
    setUser(newUser);
    setShowSetup(false);
  };

  if (showSetup) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎮 Welcome to EduPlay! 🎮</Text>
        <Text style={styles.subtitle}>Let's get to know you!</Text>

        <View style={styles.setupForm}>
          <Text style={styles.label}>What's your name?</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>How old are you?</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={2}
          />

          <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
            <Text style={styles.buttonText}>Let's Play! 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 EduPlay Offline 🎮</Text>
      <Text style={styles.tagline}>
        11 Learning Games. One Safe App. No Internet Needed.
      </Text>

      {user && (
        <Text style={styles.welcome}>Welcome back, {user.name}! 👋</Text>
      )}

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => navigation.navigate('GameSelect')}
      >
        <Text style={styles.playButtonText}>🎯 Play Games</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.parentButton}
        onPress={() => navigation.navigate('ParentDashboard')}
      >
        <Text style={styles.parentButtonText}>👨‍👩‍👧 Parent Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>✔ No Internet</Text>
        <Text style={styles.footerText}>✔ No Ads</Text>
        <Text style={styles.footerText}>✔ 100% Safe</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 20,
    color: '#333',
    marginBottom: 40,
  },
  setupForm: {
    width: '100%',
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 30,
    marginBottom: 20,
    width: '80%',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  parentButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
  },
  parentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;

