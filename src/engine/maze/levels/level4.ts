import type { LevelConfig } from '@/types/maze.types';
import { level1Config } from './level1';

export const level4Config: LevelConfig = {
  ...level1Config,
  levelNumber: 4,
  wallColor: '#b91c1c', // red
};
