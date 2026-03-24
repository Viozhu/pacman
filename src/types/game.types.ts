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

// Difficulty Configuration
export interface DifficultyConfig {
  level: number;
  ghostSpeed: number;
  pacmanSpeed: number;
  frightenedDuration: number;
  scatterChaseTimings: number[];
}

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
