import { describe, it, expect } from 'vitest';
import { PathfindingSystem } from '@/engine/systems/PathfindingSystem';
import { Maze } from '@/engine/maze/Maze';
import { Vector2D } from '@/engine/utils/Vector2D';
import { TileType } from '@/types/maze.types';
import type { LevelConfig } from '@/types/maze.types';

// ─── Test helpers ─────────────────────────────────────────────────────────────

const W = TileType.WALL;
const D = TileType.DOT;

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
      pinky:  new Vector2D(1, 1),
      inky:   new Vector2D(1, 1),
      clyde:  new Vector2D(1, 1),
    },
    ghostSpeed: 0.8,
    frightenedDuration: 8000,
    dotCount: 0,
    powerPelletCount: 0,
  };
  return new Maze(config);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PathfindingSystem.nextStep', () => {
  it('returns NONE when already at the target', () => {
    // 3×3 open maze
    const maze = makeMaze([
      [W, W, W],
      [W, D, W],
      [W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    expect(pf.nextStep(new Vector2D(1, 1), new Vector2D(1, 1))).toBe('NONE');
  });

  it('returns RIGHT for a straight horizontal path', () => {
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D D D W   from (1,1) → (3,1)
    // 2 W W W W W
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    expect(pf.nextStep(new Vector2D(1, 1), new Vector2D(3, 1))).toBe('RIGHT');
  });

  it('returns LEFT for a straight horizontal path in reverse', () => {
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    expect(pf.nextStep(new Vector2D(3, 1), new Vector2D(1, 1))).toBe('LEFT');
  });

  it('returns DOWN for a straight vertical path', () => {
    //   0 1 2
    // 0 W W W
    // 1 W D W   from (1,1) → (1,3)
    // 2 W D W
    // 3 W D W
    // 4 W W W
    const maze = makeMaze([
      [W, W, W],
      [W, D, W],
      [W, D, W],
      [W, D, W],
      [W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    expect(pf.nextStep(new Vector2D(1, 1), new Vector2D(1, 3))).toBe('DOWN');
  });

  it('returns UP for a straight vertical path in reverse', () => {
    const maze = makeMaze([
      [W, W, W],
      [W, D, W],
      [W, D, W],
      [W, D, W],
      [W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    expect(pf.nextStep(new Vector2D(1, 3), new Vector2D(1, 1))).toBe('UP');
  });

  it('navigates around a wall when the direct path is blocked', () => {
    // Open 5×5 with a wall at (2,2). From (1,1) to (3,3), BFS must detour.
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D D D W
    // 2 W D W D W
    // 3 W D D D W
    // 4 W W W W W
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, D, W, D, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    // BFS explores DOWN and RIGHT from (1,1); both are valid first moves.
    // Either 'DOWN' or 'RIGHT' reaches (3,3) in the same number of steps.
    const dir = pf.nextStep(new Vector2D(1, 1), new Vector2D(3, 3));
    expect(['DOWN', 'RIGHT']).toContain(dir);
  });

  it('returns NONE when the target is completely unreachable', () => {
    // Target at (3,1) is enclosed by walls.
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D W D W   (1,1) cannot reach (3,1)
    // 2 W W W W W
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, W, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    expect(pf.nextStep(new Vector2D(1, 1), new Vector2D(3, 1))).toBe('NONE');
  });
});
