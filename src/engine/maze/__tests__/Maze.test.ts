import { describe, it, expect } from 'vitest';
import { Maze } from '@/engine/maze/Maze';
import { TileType } from '@/types/maze.types';
import { Vector2D } from '@/engine/utils/Vector2D';
import type { LevelConfig } from '@/types/maze.types';

const W = TileType.WALL;
const D = TileType.DOT;
const T = TileType.TUNNEL;

function makeMaze(layout: number[][]): Maze {
  const height = layout.length;
  const width = layout[0]?.length ?? 0;
  const config: LevelConfig = {
    levelNumber: 1,
    width,
    height,
    tileSize: 16,
    wallColor: '#000',
    layout,
    pacmanStart: new Vector2D(1, 1),
    ghostStarts: {
      blinky: new Vector2D(1, 1),
      pinky: new Vector2D(1, 1),
      inky: new Vector2D(1, 1),
      clyde: new Vector2D(1, 1),
    },
    ghostSpeed: 0.8,
    frightenedDuration: 8000,
    dotCount: 0,
    powerPelletCount: 0,
  };
  return new Maze(config);
}

// ─── isWalkable ───────────────────────────────────────────────────────────────

describe('Maze.isWalkable — in-bounds tiles', () => {
  it('returns true for a DOT tile', () => {
    const maze = makeMaze([
      [W, W, W],
      [W, D, W],
      [W, W, W],
    ]);
    expect(maze.isWalkable(1, 1)).toBe(true);
  });

  it('returns false for a WALL tile', () => {
    const maze = makeMaze([
      [W, W, W],
      [W, D, W],
      [W, W, W],
    ]);
    expect(maze.isWalkable(0, 0)).toBe(false);
  });

  it('returns false when y is out of bounds (no y wrapping)', () => {
    const maze = makeMaze([
      [W, D, W],
    ]);
    expect(maze.isWalkable(1, -1)).toBe(false);
    expect(maze.isWalkable(1, 1)).toBe(false);
  });
});

describe('Maze.isWalkable — x wrapping for tunnels', () => {
  // Layout: TUNNEL row spans full width
  //   col:  0  1  2  3  4
  // row 0:  W  W  W  W  W
  // row 1:  T  D  D  D  T
  // row 2:  W  W  W  W  W

  it('returns true when x = -1 and the wrapped tile (rightmost) is TUNNEL', () => {
    const maze = makeMaze([
      [W, W, W, W, W],
      [T, D, D, D, T],
      [W, W, W, W, W],
    ]);
    expect(maze.isWalkable(-1, 1)).toBe(true);
  });

  it('returns false when x = -1 and the wrapped tile (rightmost) is WALL', () => {
    const maze = makeMaze([
      [W, W, W],
      [W, D, W],
      [W, W, W],
    ]);
    // width=3, wraps -1 → col 2 = WALL
    expect(maze.isWalkable(-1, 1)).toBe(false);
  });

  it('returns true when x = width and the wrapped tile (leftmost) is TUNNEL', () => {
    const maze = makeMaze([
      [W, W, W, W, W],
      [T, D, D, D, T],
      [W, W, W, W, W],
    ]);
    // width=5, wraps 5 → col 0 = TUNNEL
    expect(maze.isWalkable(5, 1)).toBe(true);
  });

  it('returns false when x = width and the wrapped tile (leftmost) is WALL', () => {
    const maze = makeMaze([
      [W, W, W],
      [W, D, W],
      [W, W, W],
    ]);
    // width=3, wraps 3 → col 0 = WALL
    expect(maze.isWalkable(3, 1)).toBe(false);
  });

  it('wrapping does not affect non-tunnel rows — WALL at wrapped position returns false', () => {
    const maze = makeMaze([
      [W, W, W, W, W],
      [T, D, D, D, T],
      [W, W, W, W, W],
    ]);
    // row 0 rightmost (col 4) is WALL — checking x=-1 on row 0 should be false
    expect(maze.isWalkable(-1, 0)).toBe(false);
    // row 2 leftmost (col 0) is WALL — checking x=5 on row 2 should be false
    expect(maze.isWalkable(5, 2)).toBe(false);
  });
});

// ─── wrapPosition ─────────────────────────────────────────────────────────────

describe('Maze.wrapPosition', () => {
  it('wraps x = -1 to width - 1', () => {
    const maze = makeMaze([[W, D, D, D, W]]);
    expect(maze.wrapPosition(-1, 0)).toEqual({ x: 4, y: 0 });
  });

  it('wraps x = width to 0', () => {
    const maze = makeMaze([[W, D, D, D, W]]);
    expect(maze.wrapPosition(5, 0)).toEqual({ x: 0, y: 0 });
  });

  it('leaves in-bounds x unchanged', () => {
    const maze = makeMaze([[W, D, D, D, W]]);
    expect(maze.wrapPosition(2, 0)).toEqual({ x: 2, y: 0 });
  });
});
