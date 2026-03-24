import type { Maze } from '@/engine/maze/Maze';
import { Vector2D } from '@/engine/utils/Vector2D';
import { DIRECTION_VECTORS } from '@/engine/utils/Direction';
import type { Direction } from '@/types/entities.types';

const DIRECTIONS: ReadonlyArray<Direction> = ['UP', 'LEFT', 'DOWN', 'RIGHT'];

export class PathfindingSystem {
  private maze: Maze;

  constructor(maze: Maze) {
    this.maze = maze;
  }

  setMaze(maze: Maze): void {
    this.maze = maze;
  }

  /** BFS: returns the first direction to take from `from` to reach `to`. */
  nextStep(from: Vector2D, to: Vector2D): Direction {
    if (from.x === to.x && from.y === to.y) return 'NONE';

    type Node = { x: number; y: number; firstDir: Direction };

    const queue: Node[] = [];
    const visited = new Set<string>();
    const key = (x: number, y: number): string => `${x},${y}`;

    visited.add(key(from.x, from.y));

    for (const dir of DIRECTIONS) {
      const vec = DIRECTION_VECTORS[dir];
      const nx = from.x + vec.x;
      const ny = from.y + vec.y;
      const k = key(nx, ny);
      if (this.maze.isWalkable(nx, ny) && !visited.has(k)) {
        visited.add(k);
        queue.push({ x: nx, y: ny, firstDir: dir });
      }
    }

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (node.x === to.x && node.y === to.y) return node.firstDir;

      for (const dir of DIRECTIONS) {
        const vec = DIRECTION_VECTORS[dir];
        const nx = node.x + vec.x;
        const ny = node.y + vec.y;
        const k = key(nx, ny);
        if (this.maze.isWalkable(nx, ny) && !visited.has(k)) {
          visited.add(k);
          queue.push({ x: nx, y: ny, firstDir: node.firstDir });
        }
      }
    }

    return 'NONE';
  }
}
