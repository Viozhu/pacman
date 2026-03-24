import { create } from 'zustand';
import { produce } from 'immer';

type Difficulty = 'easy' | 'normal' | 'hard';

interface SettingsStoreState {
  soundEnabled: boolean;
  difficulty: Difficulty;
  toggleSound: () => void;
  setDifficulty: (d: Difficulty) => void;
}

export const useSettingsStore = create<SettingsStoreState>()((set) => ({
  soundEnabled: true,
  difficulty: 'normal',

  toggleSound: () =>
    set(
      produce<SettingsStoreState>((draft) => {
        draft.soundEnabled = !draft.soundEnabled;
      }),
    ),

  setDifficulty: (difficulty) => set({ difficulty }),
}));
