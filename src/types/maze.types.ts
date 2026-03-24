import { Vector2D } from '@/engine/utils/Vector2D';

// Tile Types
export const TileType = {
  EMPTY: 0,
  WALL: 1,
  DOT: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
  TUNNEL: 5,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

// Tile Interface
export interface Tile {
  type: TileType;
  x: number;
  y: number;
  walkable: boolean;
  consumed: boolean;
}

// Maze Configuration
export interface MazeConfig {
  width: number;
  height: number;
  tileSize: number;
  wallColor: string;
  layout: number[][];
  pacmanStart: Vector2D;
  ghostStarts: {
    blinky: Vector2D;
    pinky: Vector2D;
    inky: Vector2D;
    clyde: Vector2D;
  };
}

// Level Configuration
export interface LevelConfig extends MazeConfig {
  levelNumber: number;
  ghostSpeed: number;
  frightenedDuration: number;
  dotCount: number;
  powerPelletCount: number;
}
