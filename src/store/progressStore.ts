import { create } from 'zustand';

export interface GameProgress {
  id: number;
  game_key: string;
  level: number;
  score: number;
  completed: number;
  stars: number;
  playtime: number;
  last_played: string;
}

export interface Reward {
  id: number;
  reward_key: string;
  reward_name: string;
  unlocked: number;
  unlocked_at: string;
}

interface ProgressStore {
  progress: Record<string, GameProgress>;
  rewards: Reward[];
  setProgress: (gameKey: string, data: GameProgress) => void;
  updateProgress: (gameKey: string, data: Partial<GameProgress>) => void;
  addReward: (reward: Reward) => void;
  loadProgress: (allProgress: GameProgress[]) => void;
  loadRewards: (allRewards: Reward[]) => void;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  progress: {},
  rewards: [],
  setProgress: (gameKey, data) =>
    set((state) => ({
      progress: { ...state.progress, [gameKey]: data },
    })),
  updateProgress: (gameKey, data) =>
    set((state) => ({
      progress: {
        ...state.progress,
        [gameKey]: { ...state.progress[gameKey], ...data } as GameProgress,
      },
    })),
  addReward: (reward) =>
    set((state) => ({
      rewards: [...state.rewards, reward],
    })),
  loadProgress: (allProgress) => {
    const progressMap: Record<string, GameProgress> = {};
    allProgress.forEach((p) => {
      progressMap[p.game_key] = p;
    });
    set({ progress: progressMap });
  },
  loadRewards: (allRewards) => set({ rewards: allRewards }),
}));

