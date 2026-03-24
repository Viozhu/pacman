import type { LevelConfig } from '@/types/maze.types';
import { level1Config } from './level1';

export const level3Config: LevelConfig = {
  ...level1Config,
  levelNumber: 3,
  wallColor: '#7c3aed', // purple
};
