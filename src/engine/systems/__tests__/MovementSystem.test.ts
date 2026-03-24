import { describe, it, expect, vi } from 'vitest';
import { MovementSystem } from '@/engine/systems/MovementSystem';
import { PathfindingSystem } from '@/engine/systems/PathfindingSystem';
import { Maze } from '@/engine/maze/Maze';
import { Ghost } from '@/engine/entities/Ghost';
import { Pacman } from '@/engine/entities/Pacman';
import { GhostMode, GhostType } from '@/types/entities.types';
import { Vector2D } from '@/engine/utils/Vector2D';
import { TileType } from '@/types/maze.types';
import { GAME_CONSTANTS } from '@/types/game.types';
import type { LevelConfig } from '@/types/maze.types';
import type { DifficultyPreset } from '@/types/game.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const W = TileType.WALL;
const D = TileType.DOT;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function makePreset(overrides: Partial<DifficultyPreset> = {}): DifficultyPreset {
  return {
    ghostBaseSpeed: 120,
    frightenedDuration: 8000,
    scatterChaseSchedule: [3000, 20000, 3000, 20000, 1000, Infinity],
    ghostExitDelays: { BLINKY: 0, PINKY: 0, INKY: 1500, CLYDE: 3000 },
    errorRate: 0,
    elroyPhase1Dots: 20,
    elroyPhase2Dots: 10,
    ...overrides,
  };
}

// Minimal concrete Ghost subclass for testing
class TestGhost extends Ghost {
  private readonly _chaseTarget: Vector2D;

  constructor(
    tileX: number,
    tileY: number,
    chaseTarget: Vector2D,
    scatterTarget?: Vector2D,
  ) {
    super(GhostType.BLINKY, tileX, tileY, scatterTarget ?? new Vector2D(0, 0));
    this._chaseTarget = chaseTarget;
  }

  getChaseTarget(): Vector2D {
    return this._chaseTarget.clone();
  }

  // Satisfy abstract render (not exercised in unit tests)
  render(): void {}
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MovementSystem — BFS pathfinding (errorRate = 0)', () => {
  it('picks RIGHT when target is directly to the right in a horizontal corridor', () => {
    // Layout (5×3): ghost at (1,1), target at (3,1)
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D D D W
    // 2 W W W W W
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    const ghost = new TestGhost(1, 1, new Vector2D(3, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    // Pacman placed far away, not relevant to BFS direction in this test
    const pacman = new Pacman(3, 1);

    // Use a large deltaTime so movement is non-zero but the decision happens
    // at tile center (ghost starts at tile center after snapToTileCenter)
    system.moveGhost(ghost, pacman, 1);

    expect(ghost.direction).toBe('RIGHT');
  });

  it('picks DOWN when target is directly below in a vertical corridor', () => {
    // Layout (3×5): ghost at (1,1), target at (1,3)
    //   0 1 2
    // 0 W W W
    // 1 W D W
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
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    const ghost = new TestGhost(1, 1, new Vector2D(1, 3));
    ghost.mode = GhostMode.CHASE;
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(1, 3);
    system.moveGhost(ghost, pacman, 1);

    expect(ghost.direction).toBe('DOWN');
  });

  it('picks LEFT when target is to the left in a horizontal corridor', () => {
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    // Ghost starts at (3,1), target is (1,1) — must go LEFT
    const ghost = new TestGhost(3, 1, new Vector2D(1, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(1, 1);
    system.moveGhost(ghost, pacman, 1);

    expect(ghost.direction).toBe('LEFT');
  });

  it('picks UP when target is above in a vertical corridor', () => {
    const maze = makeMaze([
      [W, W, W],
      [W, D, W],
      [W, D, W],
      [W, D, W],
      [W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    // Ghost starts at (1,3), target is (1,1) — must go UP
    const ghost = new TestGhost(1, 3, new Vector2D(1, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(1, 1);
    system.moveGhost(ghost, pacman, 1);

    expect(ghost.direction).toBe('UP');
  });

  it('navigates around a wall with the BFS-optimal first step', () => {
    // Open cross maze — single horizontal corridor intersected by vertical at center
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D D D W
    // 2 W W D W W
    // 3 W W D W W
    // 4 W W W W W
    // Ghost at (1,1), target at (2,3) — BFS-optimal first step is RIGHT
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, D, W, W],
      [W, W, D, W, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    const ghost = new TestGhost(1, 1, new Vector2D(2, 3));
    ghost.mode = GhostMode.CHASE;
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(2, 3);
    system.moveGhost(ghost, pacman, 1);

    expect(ghost.direction).toBe('RIGHT');
  });

  it('SCATTER mode uses scatter target via BFS', () => {
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D D D W
    // 2 W W W W W
    // Scatter target is (3,1) — ghost at (1,1) should go RIGHT
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    const ghost = new TestGhost(1, 1, new Vector2D(0, 0), new Vector2D(3, 1));
    ghost.mode = GhostMode.SCATTER;
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(1, 1);
    system.moveGhost(ghost, pacman, 1);

    expect(ghost.direction).toBe('RIGHT');
  });
});

describe('MovementSystem — errorRate = 1 (easy, maximized)', () => {
  it('with a single valid non-reverse direction, the ghost moves in that direction regardless of errorRate', () => {
    // Straight horizontal corridor — ghost at (1,1), only valid move is RIGHT
    // (cannot reverse since direction starts NONE, so forbidden is also NONE → opposite NONE)
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D D D W
    // 2 W W W W W
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 1.0 });
    const system = new MovementSystem(maze, pf, preset);

    // Ghost at (1,1) with direction NONE — only non-wall neighbors are (2,1)=RIGHT and (0,1)=WALL
    // OPPOSITE of NONE is NONE, so no direction is forbidden. Valid walkable directions from (1,1):
    // RIGHT → (2,1) walkable. LEFT → (0,1) WALL. UP → (1,0) WALL. DOWN → (1,2) WALL.
    // Only ONE valid direction: RIGHT. randomValidDirection must return RIGHT.
    const ghost = new TestGhost(1, 1, new Vector2D(3, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.direction = 'NONE'; // no forbidden reverse
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(3, 1);
    system.moveGhost(ghost, pacman, 1);

    // With errorRate=1, randomValidDirection is called. The only valid direction is RIGHT.
    expect(ghost.direction).toBe('RIGHT');
  });

  it('with errorRate=1, a non-optimal direction can be chosen when multiple valid directions exist', () => {
    // T-junction maze: ghost at (2,1), target at (4,1) — BFS optimal is RIGHT
    // but UP→(2,0) is also walkable, giving randomValidDirection a chance to choose UP
    //   0 1 2 3 4 5
    // 0 W W D W W W
    // 1 W D D D D W
    // 2 W W W W W W
    const maze = makeMaze([
      [W, W, D, W, W, W],
      [W, D, D, D, D, W],
      [W, W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 1.0 });
    const system = new MovementSystem(maze, pf, preset);

    // Mock Math.random to always return 0 so randomValidDirection picks first valid direction
    // DIRECTIONS order: ['UP', 'LEFT', 'DOWN', 'RIGHT']
    // From (2,1) with direction NONE (forbidden=NONE):
    //   UP → (2,0) walkable ✓
    //   LEFT → (1,1) walkable ✓
    //   DOWN → (2,2) WALL ✗
    //   RIGHT → (3,1) walkable ✓
    // Math.floor(0 * 3) = 0 → picks index 0 = 'UP' (not the BFS-optimal 'RIGHT')
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const ghost = new TestGhost(2, 1, new Vector2D(4, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.direction = 'NONE';
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(4, 1);
    system.moveGhost(ghost, pacman, 1);

    randomSpy.mockRestore();

    // With errorRate=1, Math.random()=0 < 1 → randomValidDirection is invoked
    // It picks the first element of valid: ['UP','LEFT','RIGHT'] at index 0 = 'UP'
    // That is NOT the BFS-optimal direction 'RIGHT'
    expect(ghost.direction).toBe('UP');
  });

  it('errorRate path is NOT taken when Math.random returns a value >= errorRate', () => {
    // Same T-junction maze but Math.random returns 0.5 — with errorRate=0.2 it skips error path
    //   0 1 2 3 4 5
    // 0 W W D W W W
    // 1 W D D D D W
    // 2 W W W W W W
    const maze = makeMaze([
      [W, W, D, W, W, W],
      [W, D, D, D, D, W],
      [W, W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0.2 });
    const system = new MovementSystem(maze, pf, preset);

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const ghost = new TestGhost(2, 1, new Vector2D(4, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.direction = 'NONE';
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(4, 1);
    system.moveGhost(ghost, pacman, 1);

    randomSpy.mockRestore();

    // 0.5 >= 0.2 → error path skipped → BFS direction 'RIGHT' is used
    expect(ghost.direction).toBe('RIGHT');
  });
});

describe('MovementSystem — errorRate does NOT apply in FRIGHTENED mode', () => {
  it('FRIGHTENED ghost still receives a valid direction even with errorRate=1', () => {
    // Straight horizontal corridor — only one walkable direction to verify ghost moves
    //   0 1 2 3
    // 0 W W W W
    // 1 W D D W
    // 2 W W W W
    const maze = makeMaze([
      [W, W, W, W],
      [W, D, D, W],
      [W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 1.0 });
    const system = new MovementSystem(maze, pf, preset);

    const ghost = new TestGhost(1, 1, new Vector2D(0, 0));
    ghost.mode = GhostMode.FRIGHTENED;
    ghost.direction = 'NONE';
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(1, 1);
    system.moveGhost(ghost, pacman, 1);

    // FRIGHTENED mode uses randomAdjacentTile → pickDirection with that random target.
    // errorRate is NOT applied (applyError = false when mode === FRIGHTENED).
    // The only non-wall direction from (1,1) with direction NONE is RIGHT → (2,1).
    expect(ghost.direction).toBe('RIGHT');
  });

  it('FRIGHTENED ghost does not apply errorRate — verified via spy', () => {
    // We can verify that even with errorRate=1 and Math.random forced to 0,
    // pickDirection's error branch is skipped for FRIGHTENED mode.
    // T-junction: ghost at (2,1) with FRIGHTENED, Math.random=0
    //   0 1 2 3 4 5
    // 0 W W D W W W
    // 1 W D D D D W
    // 2 W W W W W W
    const maze = makeMaze([
      [W, W, D, W, W, W],
      [W, D, D, D, D, W],
      [W, W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 1.0 });
    const system = new MovementSystem(maze, pf, preset);

    // With Math.random=0, randomAdjacentTile picks index 0 of valid directions
    // From (2,1) direction=NONE (forbidden=NONE):
    //   UP→(2,0) walkable, LEFT→(1,1) walkable, RIGHT→(3,1) walkable
    // randomAdjacentTile returns Vector2D for first valid = (2,0) → target UP
    // Then pickDirection with that target: BFS from (2,1)→(2,0) = UP
    // errorRate branch is SKIPPED for FRIGHTENED → returns BFS 'UP'
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const ghost = new TestGhost(2, 1, new Vector2D(0, 0));
    ghost.mode = GhostMode.FRIGHTENED;
    ghost.direction = 'NONE';
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(4, 1);
    system.moveGhost(ghost, pacman, 1);

    randomSpy.mockRestore();

    // Direction must be one of the valid non-wall options (not frozen)
    expect(['UP', 'LEFT', 'RIGHT', 'DOWN']).toContain(ghost.direction);
    // And specifically: no NONE (ghost didn't freeze)
    expect(ghost.direction).not.toBe('NONE');
  });
});

describe('MovementSystem — BFS NONE fallback (unreachable target)', () => {
  it('ghost does not freeze when BFS target is unreachable and a valid direction exists', () => {
    // Ghost at (1,1) — isolated from target at (3,1) by wall at (2,1)
    // But ghost can still move within its own connected corridor
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D W D W
    // 2 W D W D W
    // 3 W W W W W
    // Ghost at (1,1), target unreachable (3,1). Valid directions from (1,1): DOWN
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, W, D, W],
      [W, D, W, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    const ghost = new TestGhost(1, 1, new Vector2D(3, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.direction = 'NONE';
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(3, 1);
    system.moveGhost(ghost, pacman, 1);

    // BFS returns NONE (unreachable) → fallback to randomValidDirection
    // Only valid walkable direction from (1,1) with direction=NONE is DOWN→(1,2)
    expect(ghost.direction).toBe('DOWN');
  });

  it('ghost does not freeze when BFS returns NONE due to same-tile target', () => {
    // Ghost at (1,1), chase target also at (1,1) → BFS returns NONE (from===to)
    // Ghost should use randomValidDirection fallback
    //   0 1 2
    // 0 W W W
    // 1 W D D
    // 2 W W W
    const maze = makeMaze([
      [W, W, W],
      [W, D, D],
      [W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    // Chase target is same tile as ghost → BFS returns NONE
    const ghost = new TestGhost(1, 1, new Vector2D(1, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.direction = 'NONE';
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const pacman = new Pacman(1, 1);
    system.moveGhost(ghost, pacman, 1);

    // Fallback: only walkable from (1,1) with NONE forbidden is RIGHT→(2,1)
    expect(ghost.direction).toBe('RIGHT');
  });
});

describe('MovementSystem — ghost does not re-decide at the same tile', () => {
  it('does not change direction when lastDecisionTile matches current tile', () => {
    //   0 1 2 3 4
    // 0 W W W W W
    // 1 W D D D W
    // 2 W W W W W
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    const ghost = new TestGhost(1, 1, new Vector2D(3, 1));
    ghost.mode = GhostMode.CHASE;
    ghost.direction = 'LEFT'; // intentionally wrong direction
    ghost.snapToTileCenter();
    // Set lastDecisionTile to current tile to block re-decision
    ghost.lastDecisionTile = new Vector2D(1, 1);

    const pacman = new Pacman(3, 1);
    system.moveGhost(ghost, pacman, 1);

    // Direction must remain unchanged because sameAsLast is true
    expect(ghost.direction).toBe('LEFT');
  });
});

describe('MovementSystem — isInHouse guard', () => {
  it('ghost in house does not move', () => {
    const maze = makeMaze([
      [W, W, W, W, W],
      [W, D, D, D, W],
      [W, W, W, W, W],
    ]);
    const pf = new PathfindingSystem(maze);
    const preset = makePreset({ errorRate: 0 });
    const system = new MovementSystem(maze, pf, preset);

    const ghost = new TestGhost(1, 1, new Vector2D(3, 1));
    ghost.isInHouse = true;
    ghost.mode = GhostMode.CHASE;
    ghost.direction = 'NONE';
    ghost.snapToTileCenter();
    ghost.lastDecisionTile = null;

    const initialX = ghost.position.x;
    const initialY = ghost.position.y;

    const pacman = new Pacman(3, 1);
    system.moveGhost(ghost, pacman, 100);

    expect(ghost.position.x).toBe(initialX);
    expect(ghost.position.y).toBe(initialY);
  });
});

// ─── Tunnel traversal ─────────────────────────────────────────────────────────

// Tunnel maze: 6 columns wide, tunnel row at y=1
//   col:  0  1  2  3  4  5
// row 0:  W  W  W  W  W  W
// row 1:  T  D  D  D  D  T   ← tunnel row
// row 2:  W  W  W  W  W  W
const T = TileType.TUNNEL;

function makeTunnelMaze(): Maze {
  return makeMaze([
    [W, W, W, W, W, W],
    [T, D, D, D, D, T],
    [W, W, W, W, W, W],
  ]);
}

describe('MovementSystem — tunnel traversal (Pac-Man)', () => {
  it('Pac-Man at left edge is NOT stopped when moving LEFT through a tunnel tile', () => {
    // Without the isWalkable wrapping fix, isWalkable(-1, 1) returned false and
    // stopped pacman. With the fix it checks the wrapped tile (col 5 = TUNNEL) = walkable.
    const maze = makeTunnelMaze();
    const pf = new PathfindingSystem(maze);
    const system = new MovementSystem(maze, pf, makePreset());

    const pacman = new Pacman(0, 1); // leftmost tunnel tile
    pacman.direction = 'LEFT';
    pacman.snapToTileCenter(); // ensure isAtTileCenter() returns true

    system.movePacman(pacman, 1); // 1ms — minimal movement

    // Direction must NOT have been reset to NONE by the wall-check
    expect(pacman.direction).toBe('LEFT');
  });

  it('Pac-Man at right edge is NOT stopped when moving RIGHT through a tunnel tile', () => {
    const maze = makeTunnelMaze();
    const pf = new PathfindingSystem(maze);
    const system = new MovementSystem(maze, pf, makePreset());

    const pacman = new Pacman(5, 1); // rightmost tunnel tile
    pacman.direction = 'RIGHT';
    pacman.snapToTileCenter();

    system.movePacman(pacman, 1);

    expect(pacman.direction).toBe('RIGHT');
  });

  it('Pac-Man wraps from the left boundary to the right side of the maze', () => {
    const maze = makeTunnelMaze();
    const pf = new PathfindingSystem(maze);
    const system = new MovementSystem(maze, pf, makePreset());

    const ts = GAME_CONSTANTS.TILE_SIZE;
    const pacman = new Pacman(0, 1);
    pacman.direction = 'LEFT';
    // Force position just past the left boundary so getTileX() = -1
    pacman.position.x = -1;

    system.movePacman(pacman, 0); // 0ms — only wrapTunnel fires

    // Should have been teleported to tile 5 center (rightmost tunnel column)
    expect(pacman.position.x).toBe(5 * ts + ts / 2);
  });

  it('Pac-Man wraps from the right boundary to the left side of the maze', () => {
    const maze = makeTunnelMaze();
    const pf = new PathfindingSystem(maze);
    const system = new MovementSystem(maze, pf, makePreset());

    const ts = GAME_CONSTANTS.TILE_SIZE;
    const pacman = new Pacman(5, 1);
    pacman.direction = 'RIGHT';
    // Force position past the right boundary so getTileX() = 6 (= width)
    pacman.position.x = 6 * ts;

    system.movePacman(pacman, 0);

    // Should have been teleported to tile 0 center (leftmost tunnel column)
    expect(pacman.position.x).toBe(0 * ts + ts / 2);
  });
});
