import { Entity } from '@/engine/entities/Entity';
import { GhostMode, GhostType, GHOST_COLORS } from '@/types/entities.types';
import type { Direction } from '@/types/entities.types';
import { Vector2D } from '@/engine/utils/Vector2D';
import { GHOST_HOUSE_ENTRY, POWER_PELLET_BLINK_THRESHOLD } from '@/engine/utils/Constants';

const GHOST_SPEED = 120;           // pixels per second
const GHOST_FRIGHTENED_SPEED = 60; // pixels per second (slower when frightened)

export abstract class Ghost extends Entity {
  readonly ghostType: GhostType;
  mode: GhostMode = GhostMode.SCATTER;
  readonly scatterTarget: Vector2D;
  frightenedTimer = 0;
  isInHouse: boolean;
  prevDirection: Direction = 'NONE';
  lastDecisionTile: Vector2D | null = null;
  protected baseSpeed: number = GHOST_SPEED;

  constructor(
    ghostType: GhostType,
    tileX: number,
    tileY: number,
    scatterTarget: Vector2D,
    isInHouse = false,
  ) {
    super(tileX, tileY, 14, GHOST_SPEED);
    this.ghostType = ghostType;
    this.scatterTarget = scatterTarget;
    this.isInHouse = isInHouse;
  }

  abstract getChaseTarget(pacmanTile: Vector2D, pacmanDir: Direction): Vector2D;

  setBaseSpeed(speed: number): void {
    this.baseSpeed = speed;
    if (this.mode !== GhostMode.FRIGHTENED) {
      this.speed = speed;
    }
  }

  setMode(mode: GhostMode, frightenedDuration = 0): void {
    this.mode = mode;
    this.speed = mode === GhostMode.FRIGHTENED ? GHOST_FRIGHTENED_SPEED : this.baseSpeed;
    if (mode === GhostMode.FRIGHTENED) {
      this.frightenedTimer = frightenedDuration;
    }
  }

  getCurrentTarget(pacmanTile: Vector2D, pacmanDir: Direction): Vector2D {
    if (this.mode === GhostMode.CHASE) {
      return this.getChaseTarget(pacmanTile, pacmanDir);
    }
    if (this.mode === GhostMode.DEAD) {
      return new Vector2D(GHOST_HOUSE_ENTRY.x, GHOST_HOUSE_ENTRY.y);
    }
    // SCATTER and FRIGHTENED both use scatter target
    return this.scatterTarget.clone();
  }

  update(deltaTime: number): void {
    if (this.mode === GhostMode.FRIGHTENED) {
      this.frightenedTimer -= deltaTime;
      if (this.frightenedTimer <= 0) {
        this.setMode(GhostMode.SCATTER);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.position;
    const r = this.size / 2;

    if (this.mode === GhostMode.DEAD) {
      this.drawEyes(ctx, x, y, r);
      return;
    }

    ctx.fillStyle = this.getBodyColor();
    ctx.beginPath();
    ctx.arc(x, y - r * 0.1, r, Math.PI, 0);
    ctx.lineTo(x + r, y + r);
    // Wavy bottom
    ctx.lineTo(x + r * 0.67, y + r * 0.55);
    ctx.lineTo(x + r * 0.33, y + r);
    ctx.lineTo(x, y + r * 0.55);
    ctx.lineTo(x - r * 0.33, y + r);
    ctx.lineTo(x - r * 0.67, y + r * 0.55);
    ctx.lineTo(x - r, y + r);
    ctx.closePath();
    ctx.fill();

    this.drawEyes(ctx, x, y, r);
  }

  private getBodyColor(): string {
    if (this.mode === GhostMode.FRIGHTENED) {
      const blinking =
        this.frightenedTimer < POWER_PELLET_BLINK_THRESHOLD &&
        Math.floor(Date.now() / 250) % 2 === 0;
      return blinking ? '#FFFFFF' : '#0000FF';
    }
    return GHOST_COLORS[this.ghostType];
  }

  private drawEyes(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    const eyeR = r * 0.25;
    const ox = r * 0.3;
    const oy = -r * 0.1;
    const pupil = this.getPupilOffset(r);

    ctx.fillStyle = '#FFFFFF';
    for (const ex of [x - ox, x + ox]) {
      ctx.beginPath();
      ctx.arc(ex, y + oy, eyeR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#0000AA';
    for (const ex of [x - ox, x + ox]) {
      ctx.beginPath();
      ctx.arc(ex + pupil.x, y + oy + pupil.y, eyeR * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private getPupilOffset(r: number): { x: number; y: number } {
    const d = r * 0.15;
    switch (this.direction) {
      case 'UP':    return { x: 0, y: -d };
      case 'DOWN':  return { x: 0, y: d };
      case 'LEFT':  return { x: -d, y: 0 };
      case 'RIGHT': return { x: d, y: 0 };
      case 'NONE':  return { x: 0, y: 0 };
    }
  }
}
