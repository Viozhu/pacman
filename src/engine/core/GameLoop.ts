import { FIXED_DELTA } from '@/engine/utils/Constants';

class GameLoop {
  private running = false;
  private paused = false;
  private lastTime = 0;
  private accumulated = 0;
  private rafId: number | null = null;
  private updateFn: ((delta: number) => void) | null = null;
  private renderFn: (() => void) | null = null;

  private tick = (timestamp: number): void => {
    if (!this.running) return;

    if (!this.paused) {
      const elapsed = timestamp - this.lastTime;
      this.accumulated += elapsed;

      while (this.accumulated >= FIXED_DELTA) {
        this.updateFn?.(FIXED_DELTA);
        this.accumulated -= FIXED_DELTA;
      }

      this.renderFn?.();
    }

    this.lastTime = timestamp;
    this.rafId = requestAnimationFrame(this.tick);
  };

  start(update: (delta: number) => void, render: () => void): void {
    if (this.running) return;
    this.updateFn = update;
    this.renderFn = render;
    this.running = true;
    this.paused = false;
    this.accumulated = 0;
    this.rafId = requestAnimationFrame((ts) => {
      this.lastTime = ts;
      this.rafId = requestAnimationFrame(this.tick);
    });
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  isPaused(): boolean {
    return this.paused;
  }
}

export const gameLoop = new GameLoop();
