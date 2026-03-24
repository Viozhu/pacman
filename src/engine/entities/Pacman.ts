import { Entity } from '@/engine/entities/Entity';
import type { Direction } from '@/types/entities.types';

const PACMAN_SPEED = 130; // pixels per second
const PACMAN_SIZE = 14;
const MOUTH_SPEED = 5; // oscillations per second (in π radians)

function directionToRotation(dir: Direction): number {
  switch (dir) {
    case 'RIGHT': return 0;
    case 'DOWN':  return Math.PI / 2;
    case 'LEFT':  return Math.PI;
    case 'UP':    return -Math.PI / 2;
    case 'NONE':  return 0;
  }
}

export class Pacman extends Entity {
  bufferedDirection: Direction = 'NONE';
  private mouthAngle = 0.25; // fraction of π
  private mouthOpening = false;

  constructor(tileX: number, tileY: number) {
    super(tileX, tileY, PACMAN_SIZE, PACMAN_SPEED);
  }

  update(deltaTime: number): void {
    if (this.direction !== 'NONE') {
      this.animateMouth(deltaTime);
    }
  }

  private animateMouth(deltaTime: number): void {
    const delta = MOUTH_SPEED * (deltaTime / 1000);
    if (this.mouthOpening) {
      this.mouthAngle += delta;
      if (this.mouthAngle >= 0.25) {
        this.mouthAngle = 0.25;
        this.mouthOpening = false;
      }
    } else {
      this.mouthAngle -= delta;
      if (this.mouthAngle <= 0) {
        this.mouthAngle = 0;
        this.mouthOpening = true;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.position;
    const r = this.size / 2;
    const openAngle = this.mouthAngle * Math.PI;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(directionToRotation(this.direction));
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, openAngle, Math.PI * 2 - openAngle);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
