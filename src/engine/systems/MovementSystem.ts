import type { Entity } from '@/engine/entities/Entity';
import type { Pacman } from '@/engine/entities/Pacman';
import type { Ghost } from '@/engine/entities/Ghost';
import type { Maze } from '@/engine/maze/Maze';
import type { PathfindingSystem } from '@/engine/systems/PathfindingSystem';
import { GhostMode } from '@/types/entities.types';
import type { Direction } from '@/types/entities.types';
import { DIRECTION_VECTORS, OPPOSITE_DIRECTION } from '@/engine/utils/Direction';
import { Vector2D } from '@/engine/utils/Vector2D';
import { GHOST_HOUSE_ENTRY } from '@/engine/utils/Constants';

const DIRECTIONS: ReadonlyArray<Direction> = ['UP', 'LEFT', 'DOWN', 'RIGHT'];

export class MovementSystem {
  private readonly maze: Maze;
  private readonly pathfinding: PathfindingSystem;

  constructor(maze: Maze, pathfinding: PathfindingSystem) {
    this.maze = maze;
    this.pathfinding = pathfinding;
  }

  movePacman(pacman: Pacman, deltaTime: number): void {
    const seconds = deltaTime / 1000;

    if (pacman.isAtTileCenter()) {
      // Try buffered direction first
      if (pacman.bufferedDirection !== 'NONE') {
        const vec = DIRECTION_VECTORS[pacman.bufferedDirection];
        if (this.maze.isWalkable(pacman.getTileX() + vec.x, pacman.getTileY() + vec.y)) {
          pacman.direction = pacman.bufferedDirection;
          pacman.bufferedDirection = 'NONE';
          pacman.snapToTileCenter();
        }
      }
      // Stop if current direction hits a wall
      if (pacman.direction !== 'NONE') {
        const vec = DIRECTION_VECTORS[pacman.direction];
        if (!this.maze.isWalkable(pacman.getTileX() + vec.x, pacman.getTileY() + vec.y)) {
          pacman.direction = 'NONE';
          pacman.snapToTileCenter();
        }
      }
    }

    if (pacman.direction !== 'NONE') {
      const vec = DIRECTION_VECTORS[pacman.direction];
      pacman.position.x += vec.x * pacman.speed * seconds;
      pacman.position.y += vec.y * pacman.speed * seconds;
    }

    this.wrapTunnel(pacman);
  }

  moveGhost(ghost: Ghost, pacman: Pacman, deltaTime: number): void {
    if (ghost.isInHouse) return;

    const seconds = deltaTime / 1000;

    if (ghost.isAtTileCenter()) {
      const currentTile = new Vector2D(ghost.getTileX(), ghost.getTileY());
      const sameAsLast =
        ghost.lastDecisionTile !== null &&
        ghost.lastDecisionTile.x === currentTile.x &&
        ghost.lastDecisionTile.y === currentTile.y;

      if (!sameAsLast) {
        ghost.lastDecisionTile = currentTile;

        let bestDir: Direction;
        if (ghost.mode === GhostMode.DEAD) {
          // BFS back to ghost house entry
          const to = new Vector2D(GHOST_HOUSE_ENTRY.x, GHOST_HOUSE_ENTRY.y);
          bestDir = this.pathfinding.nextStep(currentTile, to);
        } else if (ghost.mode === GhostMode.FRIGHTENED) {
          bestDir = this.pickDirection(ghost, this.randomAdjacentTile(ghost));
        } else {
          const pacmanTile = new Vector2D(pacman.getTileX(), pacman.getTileY());
          bestDir = this.pickDirection(ghost, ghost.getCurrentTarget(pacmanTile, pacman.direction));
        }

        if (bestDir !== 'NONE') {
          ghost.prevDirection = ghost.direction;
          ghost.direction = bestDir;
          ghost.snapToTileCenter();
        }
      }
    }

    if (ghost.direction !== 'NONE') {
      const vec = DIRECTION_VECTORS[ghost.direction];
      ghost.position.x += vec.x * ghost.speed * seconds;
      ghost.position.y += vec.y * ghost.speed * seconds;
    }

    this.wrapTunnel(ghost);
  }

  private pickDirection(ghost: Ghost, target: Vector2D): Direction {
    const tx = ghost.getTileX();
    const ty = ghost.getTileY();
    const forbidden = OPPOSITE_DIRECTION[ghost.direction];

    let best: Direction = 'NONE';
    let bestDist = Infinity;

    for (const dir of DIRECTIONS) {
      if (dir === forbidden) continue;
      const vec = DIRECTION_VECTORS[dir];
      const nx = tx + vec.x;
      const ny = ty + vec.y;
      if (!this.maze.isWalkable(nx, ny)) continue;

      const dist = Math.hypot(target.x - nx, target.y - ny);
      if (dist < bestDist) {
        bestDist = dist;
        best = dir;
      }
    }

    return best;
  }

  private randomAdjacentTile(ghost: Ghost): Vector2D {
    const tx = ghost.getTileX();
    const ty = ghost.getTileY();
    const forbidden = OPPOSITE_DIRECTION[ghost.direction];

    const valid = DIRECTIONS.filter((dir) => {
      if (dir === forbidden) return false;
      const vec = DIRECTION_VECTORS[dir];
      return this.maze.isWalkable(tx + vec.x, ty + vec.y);
    });

    if (valid.length === 0) return new Vector2D(tx, ty);
    const chosen = valid[Math.floor(Math.random() * valid.length)];
    const vec = DIRECTION_VECTORS[chosen!];
    return new Vector2D(tx + vec.x, ty + vec.y);
  }

  private wrapTunnel(entity: Entity): void {
    const ts = this.maze.config.tileSize;
    const wrapped = this.maze.wrapPosition(entity.getTileX(), entity.getTileY());
    if (wrapped.x !== entity.getTileX()) {
      entity.position.x = wrapped.x * ts + ts / 2;
    }
  }
}
