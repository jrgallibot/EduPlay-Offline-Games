import { create } from 'zustand';

export interface User {
  id: number;
  name: string;
  age: number;
  avatar: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isParentMode: boolean;
  toggleParentMode: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isParentMode: false,
  toggleParentMode: () => set((state) => ({ isParentMode: !state.isParentMode })),
}));

