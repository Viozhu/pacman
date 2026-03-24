import { Direction } from '@/types/entities.types';
import { Vector2D } from '@/engine/utils/Vector2D';

export const DIRECTION_VECTORS: Record<Direction, Vector2D> = {
  UP: new Vector2D(0, -1),
  DOWN: new Vector2D(0, 1),
  LEFT: new Vector2D(-1, 0),
  RIGHT: new Vector2D(1, 0),
  NONE: new Vector2D(0, 0),
};

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
  NONE: 'NONE',
};
