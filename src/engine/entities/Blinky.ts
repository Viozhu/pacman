import { Ghost } from '@/engine/entities/Ghost';
import { GhostType, GhostMode } from '@/types/entities.types';
import type { Direction } from '@/types/entities.types';
import { Vector2D } from '@/engine/utils/Vector2D';

// Speed multipliers per Cruise Elroy phase
const ELROY_SPEED_BOOST: Record<1 | 2, number> = { 1: 1.15, 2: 1.25 };

export class Blinky extends Ghost {
  private elroyPhase: 0 | 1 | 2 = 0;

  constructor(tileX: number, tileY: number) {
    super(GhostType.BLINKY, tileX, tileY, new Vector2D(25, 0));
  }

  getChaseTarget(pacmanTile: Vector2D): Vector2D {
    return pacmanTile.clone();
  }

  // Cruise Elroy: when dots are low, ignore scatter and always chase
  getCurrentTarget(pacmanTile: Vector2D, pacmanDir: Direction): Vector2D {
    if (this.elroyPhase > 0 && this.mode === GhostMode.SCATTER) {
      return pacmanTile.clone();
    }
    return super.getCurrentTarget(pacmanTile, pacmanDir);
  }

  /**
   * Activate Cruise Elroy phase 1 or 2.
   * Phase 1: <20 dots left  → +15% speed, ignore scatter
   * Phase 2: <10 dots left  → +25% speed, ignore scatter
   */
  setElroyPhase(phase: 0 | 1 | 2): void {
    if (this.elroyPhase === phase) return;
    this.elroyPhase = phase;

    if (phase === 0) return;
    // Only boost if not currently frightened/dead (setBaseSpeed handles restoration)
    if (this.mode !== GhostMode.FRIGHTENED && this.mode !== GhostMode.DEAD) {
      this.speed = this.baseSpeed * ELROY_SPEED_BOOST[phase];
    }
  }

  // Override so speed boost survives mode changes back from FRIGHTENED
  setBaseSpeed(speed: number): void {
    super.setBaseSpeed(speed);
    if (this.elroyPhase > 0 && this.mode !== GhostMode.FRIGHTENED && this.mode !== GhostMode.DEAD) {
      this.speed = speed * ELROY_SPEED_BOOST[this.elroyPhase];
    }
  }

  resetElroy(): void {
    this.elroyPhase = 0;
  }
}
