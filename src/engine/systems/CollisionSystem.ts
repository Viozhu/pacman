import type { Pacman } from '@/engine/entities/Pacman';
import type { Ghost } from '@/engine/entities/Ghost';
import type { Maze } from '@/engine/maze/Maze';
import { GhostMode } from '@/types/entities.types';
import { TileType } from '@/types/maze.types';

export interface CollisionResult {
  ateDot: boolean;
  atePellet: boolean;
  ateGhost: Ghost | null;
  hitGhost: boolean;
}

export class CollisionSystem {
  private readonly maze: Maze;

  constructor(maze: Maze) {
    this.maze = maze;
  }

  check(pacman: Pacman, ghosts: Ghost[]): CollisionResult {
    const tx = pacman.getTileX();
    const ty = pacman.getTileY();
    const tile = this.maze.getTile(tx, ty);

    let ateDot = false;
    let atePellet = false;

    if (tile && !tile.consumed) {
      if (tile.type === TileType.DOT) {
        this.maze.consumeTile(tx, ty);
        ateDot = true;
      } else if (tile.type === TileType.POWER_PELLET) {
        this.maze.consumeTile(tx, ty);
        atePellet = true;
      }
    }

    let ateGhost: Ghost | null = null;
    let hitGhost = false;

    for (const ghost of ghosts) {
      if (!this.overlaps(pacman, ghost)) continue;
      if (ghost.mode === GhostMode.FRIGHTENED) {
        ateGhost = ghost;
      } else if (ghost.mode !== GhostMode.DEAD) {
        hitGhost = true;
      }
    }

    return { ateDot, atePellet, ateGhost, hitGhost };
  }

  private overlaps(pacman: Pacman, ghost: Ghost): boolean {
    return pacman.position.distanceTo(ghost.position) < (pacman.size + ghost.size) * 0.4;
  }
}
