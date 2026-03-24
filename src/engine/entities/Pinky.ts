import { Ghost } from '@/engine/entities/Ghost';
import { GhostType } from '@/types/entities.types';
import type { Direction } from '@/types/entities.types';
import { Vector2D } from '@/engine/utils/Vector2D';
import { DIRECTION_VECTORS } from '@/engine/utils/Direction';

export class Pinky extends Ghost {
  constructor(tileX: number, tileY: number) {
    super(GhostType.PINKY, tileX, tileY, new Vector2D(2, 0), true);
  }

  getChaseTarget(pacmanTile: Vector2D, pacmanDir: Direction): Vector2D {
    const vec = DIRECTION_VECTORS[pacmanDir];
    return new Vector2D(pacmanTile.x + vec.x * 4, pacmanTile.y + vec.y * 4);
  }
}
