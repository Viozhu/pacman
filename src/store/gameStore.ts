import { create } from 'zustand';
import { produce } from 'immer';
import type { GameStatus } from '@/types/game.types';
import { GAME_CONSTANTS } from '@/types/game.types';

interface GameStoreState {
  score: number;
  lives: number;
  level: number;
  status: GameStatus;
  dotsRemaining: number;
  powerPelletActive: boolean;
  powerPelletTimer: number;
  // Actions
  addScore: (points: number) => void;
  loseLife: () => void;
  setStatus: (status: GameStatus) => void;
  setDotsRemaining: (count: number) => void;
  activatePowerPellet: (duration: number) => void;
  nextLevel: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  score: 0,
  lives: GAME_CONSTANTS.INITIAL_LIVES,
  level: 1,
  status: { type: 'idle' } as GameStatus,
  dotsRemaining: 0,
  powerPelletActive: false,
  powerPelletTimer: 0,
};

export const useGameStore = create<GameStoreState>()((set) => ({
  ...INITIAL_STATE,

  addScore: (points) =>
    set(
      produce<GameStoreState>((draft) => {
        const prev = draft.score;
        draft.score += points;
        // Extra life at 10,000 pts (only once)
        if (prev < GAME_CONSTANTS.EXTRA_LIFE_SCORE && draft.score >= GAME_CONSTANTS.EXTRA_LIFE_SCORE) {
          draft.lives += 1;
        }
      }),
    ),

  loseLife: () =>
    set(
      produce<GameStoreState>((draft) => {
        draft.lives -= 1;
        if (draft.lives <= 0) {
          draft.status = { type: 'game-over', finalScore: draft.score };
        }
      }),
    ),

  setStatus: (status) => set({ status }),

  setDotsRemaining: (count) => set({ dotsRemaining: count }),

  activatePowerPellet: (duration) =>
    set({ powerPelletActive: true, powerPelletTimer: duration }),

  nextLevel: () =>
    set(
      produce<GameStoreState>((draft) => {
        draft.level += 1;
        draft.powerPelletActive = false;
        draft.powerPelletTimer = 0;
      }),
    ),

  reset: () => set({ ...INITIAL_STATE }),
}));
