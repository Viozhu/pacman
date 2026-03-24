import { describe, it, expect } from 'vitest';
import { DIFFICULTY_PRESETS } from '@/types/game.types';

describe('DIFFICULTY_PRESETS', () => {
  it('easy preset has correct values', () => {
    const p = DIFFICULTY_PRESETS.easy;
    expect(p.ghostBaseSpeed).toBe(95);
    expect(p.frightenedDuration).toBe(12000);
    expect(p.errorRate).toBe(0.20);
    expect(p.elroyPhase1Dots).toBe(15);
    expect(p.elroyPhase2Dots).toBe(8);
    expect(p.ghostExitDelays.INKY).toBe(2500);
    expect(p.ghostExitDelays.CLYDE).toBe(5000);
    expect(p.scatterChaseSchedule[p.scatterChaseSchedule.length - 1]).toBe(Infinity);
  });

  it('easy preset ghostExitDelays for BLINKY and PINKY are 0', () => {
    const p = DIFFICULTY_PRESETS.easy;
    expect(p.ghostExitDelays.BLINKY).toBe(0);
    expect(p.ghostExitDelays.PINKY).toBe(0);
  });

  it('normal preset has correct values', () => {
    const p = DIFFICULTY_PRESETS.normal;
    expect(p.ghostBaseSpeed).toBe(120);
    expect(p.frightenedDuration).toBe(8000);
    expect(p.errorRate).toBe(0);
    expect(p.elroyPhase1Dots).toBe(20);
    expect(p.elroyPhase2Dots).toBe(10);
    expect(p.ghostExitDelays.INKY).toBe(1500);
    expect(p.ghostExitDelays.CLYDE).toBe(3000);
  });

  it('normal preset ghostExitDelays for BLINKY and PINKY are 0', () => {
    const p = DIFFICULTY_PRESETS.normal;
    expect(p.ghostExitDelays.BLINKY).toBe(0);
    expect(p.ghostExitDelays.PINKY).toBe(0);
  });

  it('hard preset has correct values', () => {
    const p = DIFFICULTY_PRESETS.hard;
    expect(p.ghostBaseSpeed).toBe(145);
    expect(p.frightenedDuration).toBe(4000);
    expect(p.errorRate).toBe(0);
    expect(p.elroyPhase1Dots).toBe(30);
    expect(p.elroyPhase2Dots).toBe(15);
    expect(p.ghostExitDelays.INKY).toBe(0);
    expect(p.ghostExitDelays.CLYDE).toBe(0);
  });

  it('hard preset ghostExitDelays for BLINKY and PINKY are 0', () => {
    const p = DIFFICULTY_PRESETS.hard;
    expect(p.ghostExitDelays.BLINKY).toBe(0);
    expect(p.ghostExitDelays.PINKY).toBe(0);
  });

  it('all presets end their scatterChaseSchedule with Infinity', () => {
    for (const key of ['easy', 'normal', 'hard'] as const) {
      const schedule = DIFFICULTY_PRESETS[key].scatterChaseSchedule;
      expect(schedule[schedule.length - 1]).toBe(Infinity);
    }
  });

  it('easy has a higher frightenedDuration than normal', () => {
    expect(DIFFICULTY_PRESETS.easy.frightenedDuration).toBeGreaterThan(
      DIFFICULTY_PRESETS.normal.frightenedDuration,
    );
  });

  it('normal has a higher frightenedDuration than hard', () => {
    expect(DIFFICULTY_PRESETS.normal.frightenedDuration).toBeGreaterThan(
      DIFFICULTY_PRESETS.hard.frightenedDuration,
    );
  });

  it('hard has the fastest ghost base speed', () => {
    expect(DIFFICULTY_PRESETS.hard.ghostBaseSpeed).toBeGreaterThan(
      DIFFICULTY_PRESETS.normal.ghostBaseSpeed,
    );
    expect(DIFFICULTY_PRESETS.normal.ghostBaseSpeed).toBeGreaterThan(
      DIFFICULTY_PRESETS.easy.ghostBaseSpeed,
    );
  });

  it('easy has a non-zero errorRate while normal and hard have zero', () => {
    expect(DIFFICULTY_PRESETS.easy.errorRate).toBeGreaterThan(0);
    expect(DIFFICULTY_PRESETS.normal.errorRate).toBe(0);
    expect(DIFFICULTY_PRESETS.hard.errorRate).toBe(0);
  });

  it('scatterChaseSchedule is a non-empty array for every preset', () => {
    for (const key of ['easy', 'normal', 'hard'] as const) {
      expect(DIFFICULTY_PRESETS[key].scatterChaseSchedule.length).toBeGreaterThan(0);
    }
  });
});
