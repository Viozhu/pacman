import { Direction } from '@/types/entities.types';

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  w: 'UP',
  W: 'UP',
  ArrowDown: 'DOWN',
  s: 'DOWN',
  S: 'DOWN',
  ArrowLeft: 'LEFT',
  a: 'LEFT',
  A: 'LEFT',
  ArrowRight: 'RIGHT',
  d: 'RIGHT',
  D: 'RIGHT',
};

class InputManager {
  private currentDirection: Direction = 'NONE';
  private bufferedDirection: Direction | null = null;

  private handleKeyDown = (e: KeyboardEvent): void => {
    const dir = KEY_MAP[e.key];
    if (dir !== undefined) {
      e.preventDefault();
      this.bufferedDirection = dir;
      this.currentDirection = dir;
    }
  };

  init(): void {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  getCurrentDirection(): Direction {
    return this.currentDirection;
  }

  getBufferedDirection(): Direction | null {
    return this.bufferedDirection;
  }

  clearBuffer(): void {
    this.bufferedDirection = null;
  }
}

export const inputManager = new InputManager();
