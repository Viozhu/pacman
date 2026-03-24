import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringSystem } from '@/engine/systems/ScoringSystem';
import { SCORE_VALUES } from '@/types/game.types';

describe('ScoringSystem', () => {
  let scoring: ScoringSystem;

  beforeEach(() => {
    scoring = new ScoringSystem();
  });

  it('dotScore returns the dot constant', () => {
    expect(scoring.dotScore()).toBe(SCORE_VALUES.DOT);
  });

  it('pelletScore returns the power-pellet constant', () => {
    expect(scoring.pelletScore()).toBe(SCORE_VALUES.POWER_PELLET);
  });

  describe('ghostScore combo', () => {
    it('1st ghost in a combo returns 200', () => {
      expect(scoring.ghostScore()).toBe(SCORE_VALUES.GHOST_1);
    });

    it('2nd ghost in a combo returns 400', () => {
      scoring.ghostScore();
      expect(scoring.ghostScore()).toBe(SCORE_VALUES.GHOST_2);
    });

    it('3rd ghost in a combo returns 800', () => {
      scoring.ghostScore();
      scoring.ghostScore();
      expect(scoring.ghostScore()).toBe(SCORE_VALUES.GHOST_3);
    });

    it('4th ghost in a combo returns 1600', () => {
      scoring.ghostScore();
      scoring.ghostScore();
      scoring.ghostScore();
      expect(scoring.ghostScore()).toBe(SCORE_VALUES.GHOST_4);
    });

    it('5th+ ghost is capped at 1600', () => {
      for (let i = 0; i < 4; i++) scoring.ghostScore();
      expect(scoring.ghostScore()).toBe(SCORE_VALUES.GHOST_4);
    });
  });

  describe('resetCombo', () => {
    it('resets the combo so the next ghost scores 200 again', () => {
      scoring.ghostScore();
      scoring.ghostScore(); // now at 400
      scoring.resetCombo();
      expect(scoring.ghostScore()).toBe(SCORE_VALUES.GHOST_1);
    });
  });
});
