import { Vector2D } from '@/engine/utils/Vector2D';

// Direction Type
export const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

// Entity Base Interface
export interface IEntity {
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

// Pacman specific types
export interface PacmanState {
  direction: Direction;
  nextDirection: Direction | null;
  animationFrame: number;
  isAlive: boolean;
}

// Ghost Mode
export const GhostMode = {
  CHASE: 'CHASE',
  SCATTER: 'SCATTER',
  FRIGHTENED: 'FRIGHTENED',
  DEAD: 'DEAD',
} as const;

export type GhostMode = (typeof GhostMode)[keyof typeof GhostMode];

// Ghost State
export interface GhostState {
  mode: GhostMode;
  targetTile: Vector2D | null;
  isInHouse: boolean;
  exitTimer: number;
}

// Ghost Type
export const GhostType = {
  BLINKY: 'BLINKY',
  PINKY: 'PINKY',
  INKY: 'INKY',
  CLYDE: 'CLYDE',
} as const;

export type GhostType = (typeof GhostType)[keyof typeof GhostType];

// Ghost Color Map
export const GHOST_COLORS: Record<GhostType, string> = {
  [GhostType.BLINKY]: '#FF0000', // Red
  [GhostType.PINKY]: '#FFB8FF',  // Pink
  [GhostType.INKY]: '#00FFFF',   // Cyan
  [GhostType.CLYDE]: '#FFB851',  // Orange
};
