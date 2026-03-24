import { SCORE_VALUES } from '@/types/game.types';

export class ScoringSystem {
  private ghostCombo = 0;

  resetCombo(): void {
    this.ghostCombo = 0;
  }

  dotScore(): number {
    return SCORE_VALUES.DOT;
  }

  pelletScore(): number {
    return SCORE_VALUES.POWER_PELLET;
  }

  /** Returns the combo-multiplied ghost score and increments the combo counter. */
  ghostScore(): number {
    this.ghostCombo++;
    const scores = [
      SCORE_VALUES.GHOST_1,
      SCORE_VALUES.GHOST_2,
      SCORE_VALUES.GHOST_3,
      SCORE_VALUES.GHOST_4,
    ];
    return scores[Math.min(this.ghostCombo - 1, scores.length - 1)] ?? SCORE_VALUES.GHOST_4;
  }
}
