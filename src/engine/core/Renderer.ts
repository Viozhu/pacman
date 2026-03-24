import type { Tile } from '@/types/maze.types';
import { TileType } from '@/types/maze.types';

interface TextOptions {
  color?: string;
  font?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
}

class Renderer {
  private ctx: CanvasRenderingContext2D | null = null;

  init(canvas: HTMLCanvasElement): void {
    this.ctx = canvas.getContext('2d');
  }

  clear(): void {
    if (!this.ctx) return;
    const { canvas } = this.ctx;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  fillRect(x: number, y: number, w: number, h: number, color: string): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  fillCircle(x: number, y: number, radius: number, color: string): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  fillArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    color: string,
  ): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, radius, startAngle, endAngle);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawText(text: string, x: number, y: number, options: TextOptions = {}): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = options.color ?? '#ffffff';
    this.ctx.font = options.font ?? '16px monospace';
    this.ctx.textAlign = options.align ?? 'left';
    this.ctx.textBaseline = options.baseline ?? 'top';
    this.ctx.fillText(text, x, y);
  }

  drawTile(tile: Tile, tileSize: number, wallColor = '#1a1aff'): void {
    if (!this.ctx) return;
    const px = tile.x * tileSize;
    const py = tile.y * tileSize;

    switch (tile.type) {
      case TileType.WALL:
        this.fillRect(px, py, tileSize, tileSize, wallColor);
        break;
      case TileType.DOT:
        if (!tile.consumed) {
          this.fillCircle(px + tileSize / 2, py + tileSize / 2, 2, '#ffb8ae');
        }
        break;
      case TileType.POWER_PELLET:
        if (!tile.consumed) {
          this.fillCircle(px + tileSize / 2, py + tileSize / 2, 5, '#ffb8ae');
        }
        break;
      case TileType.GHOST_HOUSE:
        this.fillRect(px, py, tileSize, tileSize, '#1a1a1a');
        break;
      case TileType.TUNNEL:
        this.fillRect(px, py, tileSize, tileSize, '#000000');
        break;
      case TileType.EMPTY:
        break;
    }
  }

  save(): void {
    this.ctx?.save();
  }

  restore(): void {
    this.ctx?.restore();
  }
}

export const renderer = new Renderer();
