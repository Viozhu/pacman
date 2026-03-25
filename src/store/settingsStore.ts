import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';

type Difficulty = 'easy' | 'normal' | 'hard';

interface SettingsStoreState {
  volume: number;
  lastVolume: number;
  difficulty: Difficulty;
  setVolume: (v: number) => void;
  mute: () => void;
  unmute: () => void;
  setDifficulty: (d: Difficulty) => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      volume: 0.7,
      lastVolume: 0.7,
      difficulty: 'normal',

      setVolume: (v) =>
        set(
          produce<SettingsStoreState>((draft) => {
            draft.volume = Math.max(0, Math.min(1, v));
          }),
        ),

      mute: () =>
        set(
          produce<SettingsStoreState>((draft) => {
            if (draft.volume > 0) draft.lastVolume = draft.volume;
            draft.volume = 0;
          }),
        ),

      unmute: () =>
        set(
          produce<SettingsStoreState>((draft) => {
            draft.volume = draft.lastVolume > 0 ? draft.lastVolume : 0.7;
          }),
        ),

      setDifficulty: (difficulty) => set({ difficulty }),
    }),
    {
      name: 'pac-man-settings',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const old = persistedState as Record<string, unknown>;
          return {
            volume: old['soundEnabled'] === false ? 0 : 0.7,
            lastVolume: 0.7,
            difficulty: (old['difficulty'] as Difficulty) ?? 'normal',
          };
        }
        return persistedState as Partial<SettingsStoreState>;
      },
    },
  ),
);
