import type { LevelConfig } from '@/types/maze.types';
import { level1Config } from './level1';

export const level2Config: LevelConfig = {
  ...level1Config,
  levelNumber: 2,
  wallColor: '#0891b2', // cyan
};
