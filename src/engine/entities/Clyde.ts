import { Ghost } from '@/engine/entities/Ghost';
import { GhostType } from '@/types/entities.types';
import { Vector2D } from '@/engine/utils/Vector2D';

export class Clyde extends Ghost {
  constructor(tileX: number, tileY: number) {
    super(GhostType.CLYDE, tileX, tileY, new Vector2D(0, 30), true);
  }

  getChaseTarget(pacmanTile: Vector2D): Vector2D {
    const dist = Math.hypot(this.getTileX() - pacmanTile.x, this.getTileY() - pacmanTile.y);
    return dist > 8 ? pacmanTile.clone() : this.scatterTarget.clone();
  }
}
