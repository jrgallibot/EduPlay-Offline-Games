/**
 * Web-only database layer using localStorage.
 * Same API as db.ts so the app works identically in the browser.
 */

const STORAGE_KEY = 'eduplay_web_db';

type UserRow = { id: number; name: string; age: number; avatar: string | null };
type GameProgressRow = {
  id: number;
  game_key: string;
  level: number;
  score: number;
  completed: number;
  stars: number;
  playtime: number;
  last_played: string | null;
};
type RewardRow = {
  id: number;
  reward_key: string;
  reward_name: string | null;
  unlocked: number;
  unlocked_at: string | null;
};
type SettingRow = { id: number; key: string; value: string | null };

type WebStore = {
  user: UserRow[];
  game_progress: GameProgressRow[];
  rewards: RewardRow[];
  settings: SettingRow[];
};

const GAME_KEYS = [
  'math', 'story', 'world', 'art', 'science', 'chef', 'code', 'eco',
  'music', 'logic', 'fruit', 'colorMatch', 'letterPop', 'numberHop', 'animalSound',
];

function loadStore(): WebStore {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      return JSON.parse(raw) as WebStore;
    }
  } catch (_) {}
  return {
    user: [],
    game_progress: [],
    rewards: [],
    settings: [],
  };
}

function saveStore(store: WebStore): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  } catch (e) {
    console.error('Web DB save error:', e);
  }
}

// Dummy for compatibility (not used on web)
export const db = {} as unknown;

export const initDB = async (): Promise<void> => {
  const store = loadStore();
  let changed = false;

  if (store.game_progress.length === 0) {
    store.game_progress = GAME_KEYS.map((game_key, i) => ({
      id: i + 1,
      game_key,
      level: 1,
      score: 0,
      completed: 0,
      stars: 0,
      playtime: 0,
      last_played: null,
    }));
    changed = true;
  }

  if (changed) saveStore(store);
  console.log('Database (web) initialized successfully');
};

export const executeSQL = (sql: string, params: any[] = []): any[] => {
  const sqlUpper = sql.trim().toUpperCase();
  const store = loadStore();

  if (sqlUpper.includes('INSERT OR REPLACE INTO SETTINGS')) {
    const [key, value] = params;
    const idx = store.settings.findIndex((s) => s.key === key);
    const row: SettingRow = {
      id: idx >= 0 ? store.settings[idx].id : store.settings.length + 1,
      key,
      value: value != null ? String(value) : null,
    };
    if (idx >= 0) store.settings[idx] = row;
    else store.settings.push(row);
    saveStore(store);
    return [];
  }

  if (sqlUpper.startsWith('SELECT')) {
    if (sqlUpper.includes('FROM USER')) {
      return store.user.slice(0, 1);
    }
    if (sqlUpper.includes('FROM GAME_PROGRESS') && sqlUpper.includes('WHERE')) {
      const [gameKey] = params;
      return store.game_progress.filter((r) => r.game_key === gameKey);
    }
    if (sqlUpper.includes('FROM GAME_PROGRESS')) {
      return [...store.game_progress].sort((a, b) => a.game_key.localeCompare(b.game_key));
    }
    if (sqlUpper.includes('FROM REWARDS')) {
      return store.rewards.filter((r) => r.unlocked === 1);
    }
    if (sqlUpper.includes('FROM SETTINGS') && sqlUpper.includes('WHERE')) {
      const [key] = params;
      return store.settings.filter((s) => s.key === key);
    }
  }
  return [];
};

export const getUser = async (): Promise<UserRow | null> => {
  const result = executeSQL('SELECT * FROM user LIMIT 1');
  return result.length > 0 ? (result[0] as UserRow) : null;
};

export const createUser = async (name: string, age: number, avatar?: string): Promise<void> => {
  const store = loadStore();
  store.user = [{
    id: 1,
    name,
    age,
    avatar: avatar || '👦',
  }];
  saveStore(store);
};

export const getGameProgress = async (gameKey: string): Promise<GameProgressRow | null> => {
  const result = executeSQL('SELECT * FROM game_progress WHERE game_key = ?', [gameKey]);
  return result.length > 0 ? (result[0] as GameProgressRow) : null;
};

export const updateGameProgress = async (
  gameKey: string,
  data: {
    level?: number;
    score?: number;
    completed?: number;
    stars?: number;
    playtime?: number;
  }
): Promise<void> => {
  const store = loadStore();
  const row = store.game_progress.find((r) => r.game_key === gameKey);
  if (!row) return;
  if (data.level !== undefined) row.level = data.level;
  if (data.score !== undefined) row.score = data.score;
  if (data.completed !== undefined) row.completed = data.completed;
  if (data.stars !== undefined) row.stars = data.stars;
  if (data.playtime !== undefined) row.playtime = data.playtime;
  row.last_played = new Date().toISOString();
  saveStore(store);
};

export const getAllProgress = async (): Promise<GameProgressRow[]> => {
  return executeSQL('SELECT * FROM game_progress ORDER BY game_key') as GameProgressRow[];
};

export const unlockReward = async (rewardKey: string, rewardName: string): Promise<void> => {
  const store = loadStore();
  const existing = store.rewards.find((r) => r.reward_key === rewardKey);
  if (existing) {
    existing.reward_name = rewardName;
    existing.unlocked = 1;
    existing.unlocked_at = new Date().toISOString();
  } else {
    store.rewards.push({
      id: store.rewards.length + 1,
      reward_key: rewardKey,
      reward_name: rewardName,
      unlocked: 1,
      unlocked_at: new Date().toISOString(),
    });
  }
  saveStore(store);
};

export const getRewards = async (): Promise<RewardRow[]> => {
  return executeSQL('SELECT * FROM rewards WHERE unlocked = 1') as RewardRow[];
};

export const getSetting = (key: string): string | null => {
  const result = executeSQL('SELECT value FROM settings WHERE key = ?', [key]);
  return result.length > 0 && result[0].value != null ? String(result[0].value) : null;
};

export const setSetting = (key: string, value: string): void => {
  executeSQL('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
};
