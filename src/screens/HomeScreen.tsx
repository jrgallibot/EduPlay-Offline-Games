import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
} from 'react-native';

// App logo for header and setup screens
const APP_LOGO = require('../../assets/logo.png');
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
      Alert.alert('Oops!', 'Please enter your name');
      return;
    }
    if (!age || parseInt(age, 10) < 3 || parseInt(age, 10) > 12) {
      Alert.alert('Oops!', 'Please enter age between 3 and 12');
      return;
    }

    await createUser(name.trim(), parseInt(age, 10));
    const newUser = await getUser();
    setUser(newUser);
    setShowSetup(false);
  };

  if (showSetup) {
    return (
      <SafeAreaView style={[styles.containerSetup, Platform.OS === 'web' && styles.containerWeb]}>
        <View style={styles.setupHeader}>
          <View style={styles.setupLogoCircle}>
            <Image source={APP_LOGO} style={styles.setupLogoImage} resizeMode="cover" />
          </View>
          <Text style={styles.setupHeaderTitle}>Welcome to EduPlay!</Text>
          <Text style={styles.setupHeaderSubtitle}>Let's get to know you</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.setupScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.setupForm}>
            <Text style={styles.label}>What's your name?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Type your name"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
            <Text style={styles.label}>How old are you?</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="3 to 12"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={2}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateUser}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Let's Play! 🚀</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'web' && styles.containerWeb]}>
      <View style={[styles.scrollWrapper, Platform.OS === 'web' && styles.scrollWrapperWeb]}>
        <ScrollView
          style={Platform.OS === 'web' ? styles.scrollViewWeb : undefined}
          contentContainerStyle={styles.homeScrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerLogoCircle}>
              <Image source={APP_LOGO} style={styles.headerLogoImage} resizeMode="cover" />
            </View>
            <Text style={styles.headerTitle}>EduPlay Offline</Text>
            <Text style={styles.headerTagline}>
              15 Learning Games • No Internet Needed
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>15 Games</Text>
            </View>
          </View>

          <View style={styles.content}>
            {user && (
              <Text style={styles.welcome}>Hi, {user.name}! 👋</Text>
            )}
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => navigation.navigate('GameSelect')}
              activeOpacity={0.85}
            >
              <Text style={styles.playButtonText}>🎯 Play Games</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.parentButton}
              onPress={() => navigation.navigate('ParentDashboard')}
              activeOpacity={0.85}
            >
              <Text style={styles.parentButtonText}>👨‍👩‍👧 Parent Dashboard</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>✔ No Internet</Text>
              <Text style={styles.footerText}>✔ No Ads</Text>
              <Text style={styles.footerText}>✔ 100% Safe</Text>
            </View>
            <View style={styles.footerCredit}>
              <Text style={styles.footerCreditLabel}>Developed by</Text>
              <Text style={styles.footerCreditName}>Russel Gallibot</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  containerWeb: {
    minHeight: 0,
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollWrapperWeb: {
    minHeight: 0,
    overflow: 'hidden',
  },
  scrollViewWeb: {
    flex: 1,
  },
  homeScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  containerSetup: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  setupHeader: {
    backgroundColor: '#2E7D32',
    paddingTop: 48,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  setupLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  setupLogoImage: {
    width: '100%',
    height: '100%',
  },
  setupHeaderTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  setupHeaderSubtitle: {
    fontSize: 16,
    color: '#C8E6C9',
    textAlign: 'center',
    marginTop: 6,
  },
  setupScroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 28,
  },
  setupForm: {
    width: '100%',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 44,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  headerLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  headerLogoImage: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerTagline: {
    fontSize: 15,
    color: '#C8E6C9',
    textAlign: 'center',
    marginTop: 8,
  },
  badge: {
    marginTop: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 10,
    marginTop: 18,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 17,
    borderWidth: 3,
    borderColor: '#A5D6A7',
  },
  playButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 28,
    marginBottom: 18,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1B5E20',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  parentButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0D47A1',
  },
  parentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 28,
    marginTop: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1B5E20',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#C8E6C9',
    borderTopWidth: 2,
    borderTopColor: '#A5D6A7',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 14,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  footerCredit: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 125, 50, 0.35)',
    width: '100%',
  },
  footerCreditLabel: {
    fontSize: 12,
    color: '#2E7D32',
    opacity: 0.9,
    marginBottom: 2,
  },
  footerCreditName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;

