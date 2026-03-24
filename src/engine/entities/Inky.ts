import { Ghost } from '@/engine/entities/Ghost';
import { GhostType } from '@/types/entities.types';
import type { Direction } from '@/types/entities.types';
import { Vector2D } from '@/engine/utils/Vector2D';
import { DIRECTION_VECTORS } from '@/engine/utils/Direction';

export class Inky extends Ghost {
  private readonly blinky: Ghost;

  constructor(tileX: number, tileY: number, blinky: Ghost) {
    super(GhostType.INKY, tileX, tileY, new Vector2D(27, 30), true);
    this.blinky = blinky;
  }

  getChaseTarget(pacmanTile: Vector2D, pacmanDir: Direction): Vector2D {
    const vec = DIRECTION_VECTORS[pacmanDir];
    const pivot = new Vector2D(pacmanTile.x + vec.x * 2, pacmanTile.y + vec.y * 2);
    const blinkyTile = new Vector2D(this.blinky.getTileX(), this.blinky.getTileY());
    return new Vector2D(
      blinkyTile.x + (pivot.x - blinkyTile.x) * 2,
      blinkyTile.y + (pivot.y - blinkyTile.y) * 2,
    );
  }
}
