import { describe, it, expect } from 'vitest';
import { mazeLoader } from '@/engine/maze/MazeLoader';
import { level1Config } from '@/engine/maze/levels/level1';
import { level2Config } from '@/engine/maze/levels/level2';
import { level3Config } from '@/engine/maze/levels/level3';
import { level4Config } from '@/engine/maze/levels/level4';
import { level5Config } from '@/engine/maze/levels/level5';

describe('MazeLoader', () => {
  it('returns level1Config for level 1', () => {
    expect(mazeLoader.getLevel(1)).toBe(level1Config);
  });

  it('returns level2Config for level 2', () => {
    expect(mazeLoader.getLevel(2)).toBe(level2Config);
  });

  it('returns level3Config for level 3', () => {
    expect(mazeLoader.getLevel(3)).toBe(level3Config);
  });

  it('returns level4Config for level 4', () => {
    expect(mazeLoader.getLevel(4)).toBe(level4Config);
  });

  it('returns level5Config for level 5', () => {
    expect(mazeLoader.getLevel(5)).toBe(level5Config);
  });

  it('falls back to level1Config for an unknown level number', () => {
    expect(mazeLoader.getLevel(99)).toBe(level1Config);
    expect(mazeLoader.getLevel(0)).toBe(level1Config);
  });

  it('each level has a unique wall color', () => {
    const colors = [1, 2, 3, 4, 5].map((n) => mazeLoader.getLevel(n).wallColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(5);
  });

  it('each level has the correct levelNumber', () => {
    for (let n = 1; n <= 5; n++) {
      expect(mazeLoader.getLevel(n).levelNumber).toBe(n);
    }
  });

  it('all levels share the same maze dimensions', () => {
    const { width, height } = level1Config;
    for (let n = 2; n <= 5; n++) {
      const cfg = mazeLoader.getLevel(n);
      expect(cfg.width).toBe(width);
      expect(cfg.height).toBe(height);
    }
  });
});
