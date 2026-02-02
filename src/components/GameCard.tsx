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
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.stats}>Level {level}</Text>
        <Text style={styles.stars}>{'⭐'.repeat(Math.min(stars, 3))}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#C8E6C9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#A5D6A7',
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 36,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  stats: {
    fontSize: 13,
    color: '#388E3C',
    fontWeight: '600',
  },
  stars: {
    fontSize: 14,
  },
});

