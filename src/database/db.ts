import * as SQLite from 'expo-sqlite';
import { schema, seedData } from './schema';

// Open database using new synchronous API (Expo SDK 50+)
export const db = SQLite.openDatabaseSync('eduplay.db');

// Initialize database - create tables and seed data
export const initDB = async () => {
  try {
    // Execute schema to create tables (execSync for raw SQL without parameters)
    db.execSync(schema);
    // Seed initial data
    db.execSync(seedData);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Helper function to execute SQL queries
export const executeSQL = (sql: string, params: any[] = []): any[] => {
  try {
    const sqlUpper = sql.trim().toUpperCase();
    
    // Use getAllSync for SELECT queries
    if (sqlUpper.startsWith('SELECT')) {
      return db.getAllSync(sql, params);
    }
    
    // Use runSync for INSERT, UPDATE, DELETE
    db.runSync(sql, params);
    return [];
  } catch (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
};

// Get user from database
export const getUser = async () => {
  const result = executeSQL('SELECT * FROM user LIMIT 1');
  return result.length > 0 ? result[0] : null;
};

// Create new user
export const createUser = async (name: string, age: number, avatar?: string) => {
  executeSQL(
    'INSERT INTO user (name, age, avatar) VALUES (?, ?, ?)',
    [name, age, avatar || '👦']
  );
};

// Get game progress for a specific game
export const getGameProgress = async (gameKey: string) => {
  const result = executeSQL(
    'SELECT * FROM game_progress WHERE game_key = ?',
    [gameKey]
  );
  return result.length > 0 ? result[0] : null;
};

// Update game progress
export const updateGameProgress = async (
  gameKey: string,
  data: {
    level?: number;
    score?: number;
    completed?: number;
    stars?: number;
    playtime?: number;
  }
) => {
  const fields = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(data);
  
  executeSQL(
    `UPDATE game_progress SET ${fields}, last_played = datetime('now') WHERE game_key = ?`,
    [...values, gameKey]
  );
};

// Get all game progress
export const getAllProgress = async () => {
  return executeSQL('SELECT * FROM game_progress ORDER BY game_key');
};

// Unlock a reward
export const unlockReward = async (rewardKey: string, rewardName: string) => {
  executeSQL(
    'INSERT OR REPLACE INTO rewards (reward_key, reward_name, unlocked, unlocked_at) VALUES (?, ?, 1, datetime("now"))',
    [rewardKey, rewardName]
  );
};

// Get all unlocked rewards
export const getRewards = async () => {
  return executeSQL('SELECT * FROM rewards WHERE unlocked = 1');
};

// Get a setting value
export const getSetting = (key: string): string | null => {
  const result = executeSQL('SELECT value FROM settings WHERE key = ?', [key]);
  return result.length > 0 && result[0].value != null ? String(result[0].value) : null;
};

// Set a setting value
export const setSetting = (key: string, value: string) => {
  executeSQL(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
};
