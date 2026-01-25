import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface GameCardProps {
  title: string;
  icon: string;
  level: number;
  stars: number;
  onPress: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  icon,
  level,
  stars,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.stats}>Level {level}</Text>
        <Text style={styles.stars}>{'⭐'.repeat(stars)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    margin: '2.5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  stats: {
    fontSize: 12,
    color: '#666',
  },
  stars: {
    fontSize: 12,
  },
});

