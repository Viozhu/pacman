export { GAME_CONSTANTS, SCORE_VALUES } from '@/types/game.types';

export const FIXED_DELTA = 1000 / 60;

export const GHOST_HOUSE_ENTRY = { x: 13, y: 14 };

export const SCATTER_TARGETS = {
  BLINKY: { x: 25, y: 0 },
  PINKY: { x: 2, y: 0 },
  INKY: { x: 27, y: 30 },
  CLYDE: { x: 0, y: 30 },
} as const;

export const POWER_PELLET_BLINK_THRESHOLD = 2000;
