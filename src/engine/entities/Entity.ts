import type { IEntity, Direction } from '@/types/entities.types';
import { Vector2D } from '@/engine/utils/Vector2D';
import { GAME_CONSTANTS } from '@/types/game.types';

export abstract class Entity implements IEntity {
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  direction: Direction;
  speed: number; // pixels per second

  constructor(tileX: number, tileY: number, size: number, speed: number) {
    const half = GAME_CONSTANTS.TILE_SIZE / 2;
    this.position = new Vector2D(
      tileX * GAME_CONSTANTS.TILE_SIZE + half,
      tileY * GAME_CONSTANTS.TILE_SIZE + half,
    );
    this.velocity = Vector2D.zero();
    this.size = size;
    this.direction = 'NONE';
    this.speed = speed;
  }

  getTileX(): number {
    return Math.floor(this.position.x / GAME_CONSTANTS.TILE_SIZE);
  }

  getTileY(): number {
    return Math.floor(this.position.y / GAME_CONSTANTS.TILE_SIZE);
  }

  snapToTileCenter(): void {
    const ts = GAME_CONSTANTS.TILE_SIZE;
    this.position.x = this.getTileX() * ts + ts / 2;
    this.position.y = this.getTileY() * ts + ts / 2;
  }

  isAtTileCenter(threshold = 4): boolean {
    const ts = GAME_CONSTANTS.TILE_SIZE;
    return (
      Math.abs((this.position.x % ts) - ts / 2) <= threshold &&
      Math.abs((this.position.y % ts) - ts / 2) <= threshold
    );
  }

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}
