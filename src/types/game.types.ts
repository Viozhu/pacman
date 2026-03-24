import type { GhostType } from '@/types/entities.types';

// Game Status Types
export type GameStatus =
  | { type: 'idle' }
  | { type: 'ready'; countdown: number }
  | { type: 'playing'; startTime: number }
  | { type: 'paused'; pauseTime: number }
  | { type: 'game-over'; finalScore: number }
  | { type: 'victory'; finalScore: number };

// Game State Interface
export interface GameState {
  readonly score: number;
  readonly lives: number;
  readonly level: number;
  readonly status: GameStatus;
  readonly dotsRemaining: number;
  readonly powerPelletActive: boolean;
  readonly powerPelletTimer: number;
}

// High Score Types
export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  level: number;
  timestamp: number;
}

// Difficulty Preset — controls all AI and pacing parameters per difficulty level
export interface DifficultyPreset {
  ghostBaseSpeed: number;                     // px/s — base speed for level 1
  frightenedDuration: number;                 // ms — fixed, no per-level decay
  scatterChaseSchedule: readonly number[];    // alternating scatter/chase ms; Infinity = forever
  ghostExitDelays: Record<GhostType, number>; // ms after level/life-reset before ghost exits house
  errorRate: number;                          // 0–1: chance of random direction instead of BFS optimal
  elroyPhase1Dots: number;
  elroyPhase2Dots: number;
}

export const DIFFICULTY_PRESETS: Record<'easy' | 'normal' | 'hard', DifficultyPreset> = {
  easy: {
    ghostBaseSpeed: 95,
    frightenedDuration: 12000,
    scatterChaseSchedule: [7000, 20000, 3000, 20000, 1000, Infinity],
    ghostExitDelays: { BLINKY: 0, PINKY: 0, INKY: 2500, CLYDE: 5000 },
    errorRate: 0.20,
    elroyPhase1Dots: 15,
    elroyPhase2Dots: 8,
  },
  normal: {
    ghostBaseSpeed: 120,
    frightenedDuration: 8000,
    scatterChaseSchedule: [3000, 20000, 3000, 20000, 1000, Infinity],
    ghostExitDelays: { BLINKY: 0, PINKY: 0, INKY: 1500, CLYDE: 3000 },
    errorRate: 0,
    elroyPhase1Dots: 20,
    elroyPhase2Dots: 10,
  },
  hard: {
    ghostBaseSpeed: 145,
    frightenedDuration: 4000,
    scatterChaseSchedule: [2000, 25000, 2000, 25000, 1000, Infinity],
    ghostExitDelays: { BLINKY: 0, PINKY: 0, INKY: 0, CLYDE: 0 },
    errorRate: 0,
    elroyPhase1Dots: 30,
    elroyPhase2Dots: 15,
  },
};

// Game Constants
export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 448,
  CANVAS_HEIGHT: 496,
  TILE_SIZE: 16,
  MAZE_WIDTH: 28,
  MAZE_HEIGHT: 31,
  TARGET_FPS: 60,
  INITIAL_LIVES: 3,
  EXTRA_LIFE_SCORE: 10000,
} as const;

// Scoring Constants
export const SCORE_VALUES = {
  DOT: 10,
  POWER_PELLET: 50,
  GHOST_1: 200,
  GHOST_2: 400,
  GHOST_3: 800,
  GHOST_4: 1600,
} as const;
