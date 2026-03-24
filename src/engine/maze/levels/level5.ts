import type { LevelConfig } from '@/types/maze.types';
import { level1Config } from './level1';

export const level5Config: LevelConfig = {
  ...level1Config,
  levelNumber: 5,
  wallColor: '#c2410c', // orange
};
