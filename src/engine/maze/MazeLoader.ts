import type { LevelConfig } from '@/types/maze.types';
import { level1Config } from './levels/level1';
import { level2Config } from './levels/level2';
import { level3Config } from './levels/level3';
import { level4Config } from './levels/level4';
import { level5Config } from './levels/level5';

const LEVELS: Record<number, LevelConfig> = {
  1: level1Config,
  2: level2Config,
  3: level3Config,
  4: level4Config,
  5: level5Config,
};

export const mazeLoader = {
  getLevel(level: number): LevelConfig {
    return LEVELS[level] ?? level1Config;
  },
};
