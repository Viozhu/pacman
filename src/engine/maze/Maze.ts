import type { Tile, LevelConfig } from '@/types/maze.types';
import { TileType } from '@/types/maze.types';

const WALKABLE_TYPES: ReadonlySet<TileType> = new Set<TileType>([
  TileType.EMPTY,
  TileType.DOT,
  TileType.POWER_PELLET,
  TileType.GHOST_HOUSE,
  TileType.TUNNEL,
]);

export class Maze {
  private tiles: Tile[][];
  readonly config: LevelConfig;

  constructor(config: LevelConfig) {
    this.config = config;
    this.tiles = this.buildTiles(config);
  }

  private buildTiles(config: LevelConfig): Tile[][] {
    return config.layout.map((row, y) =>
      row.map((typeValue, x) => ({
        type: typeValue as TileType,
        x,
        y,
        walkable: WALKABLE_TYPES.has(typeValue as TileType),
        consumed: false,
      })),
    );
  }

  getTile(x: number, y: number): Tile | null {
    if (y < 0 || y >= this.config.height || x < 0 || x >= this.config.width) {
      return null;
    }
    return this.tiles[y]?.[x] ?? null;
  }

  isWalkable(x: number, y: number): boolean {
    const { width } = this.config;
    let wx = x;
    if (x < 0) wx = width - 1;
    else if (x >= width) wx = 0;
    const tile = this.getTile(wx, y);
    return tile !== null && tile.walkable;
  }

  consumeTile(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile || tile.consumed) return false;
    if (tile.type === TileType.DOT || tile.type === TileType.POWER_PELLET) {
      tile.consumed = true;
      return true;
    }
    return false;
  }

  getRemainingDots(): number {
    let count = 0;
    for (const row of this.tiles) {
      for (const tile of row) {
        if ((tile.type === TileType.DOT || tile.type === TileType.POWER_PELLET) && !tile.consumed) {
          count++;
        }
      }
    }
    return count;
  }

  reset(): void {
    this.tiles = this.buildTiles(this.config);
  }

  wrapPosition(x: number, y: number): { x: number; y: number } {
    const { width } = this.config;
    let wx = x;
    if (x < 0) wx = width - 1;
    else if (x >= width) wx = 0;
    return { x: wx, y };
  }
}
