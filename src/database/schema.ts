export const schema = `
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS game_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_key TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  playtime INTEGER DEFAULT 0,
  last_played TEXT
);

CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reward_key TEXT NOT NULL UNIQUE,
  reward_name TEXT,
  unlocked INTEGER DEFAULT 0,
  unlocked_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT
);
`;

export const seedData = `
INSERT OR IGNORE INTO game_progress (game_key, level, score) VALUES
  ('math', 1, 0),
  ('story', 1, 0),
  ('world', 1, 0),
  ('art', 1, 0),
  ('science', 1, 0),
  ('chef', 1, 0),
  ('code', 1, 0),
  ('eco', 1, 0),
  ('music', 1, 0),
  ('logic', 1, 0),
  ('fruit', 1, 0),
  ('colorMatch', 1, 0),
  ('letterPop', 1, 0),
  ('numberHop', 1, 0),
  ('animalSound', 1, 0);
`;

