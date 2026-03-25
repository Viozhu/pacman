import { Maze } from '@/engine/maze/Maze';
import { mazeLoader } from '@/engine/maze/MazeLoader';
import { Pacman } from '@/engine/entities/Pacman';
import { Blinky } from '@/engine/entities/Blinky';
import { Pinky } from '@/engine/entities/Pinky';
import { Inky } from '@/engine/entities/Inky';
import { Clyde } from '@/engine/entities/Clyde';
import type { Ghost } from '@/engine/entities/Ghost';
import { MovementSystem } from '@/engine/systems/MovementSystem';
import { CollisionSystem } from '@/engine/systems/CollisionSystem';
import { PathfindingSystem } from '@/engine/systems/PathfindingSystem';
import { ScoringSystem } from '@/engine/systems/ScoringSystem';
import { renderer } from '@/engine/core/Renderer';
import { inputManager } from '@/engine/core/InputManager';
import { GhostMode, GhostType } from '@/types/entities.types';
import type { GameStatus, DifficultyPreset } from '@/types/game.types';
import { GAME_CONSTANTS, DIFFICULTY_PRESETS } from '@/types/game.types';
import type { LevelConfig } from '@/types/maze.types';
import type { Vector2D } from '@/engine/utils/Vector2D';
import { GHOST_HOUSE_ENTRY } from '@/engine/utils/Constants';
import { soundManager } from '@/engine/core/SoundManager';

const MAX_LEVELS = 5;

const GHOST_REVIVE_DELAY = 3000;

export interface GameCallbacks {
  addScore: (points: number) => void;
  loseLife: () => void;
  setStatus: (status: GameStatus) => void;
  setDotsRemaining: (count: number) => void;
  activatePowerPellet: (duration: number) => void;
  nextLevel: () => void;
  getStatus: () => GameStatus;
  getScore: () => number;
  getLevel: () => number;
}

export class Game {
  private currentConfig: LevelConfig;
  private maze: Maze;
  private readonly pacman: Pacman;
  private readonly blinky: Blinky;
  private readonly ghosts: Ghost[];
  private readonly movement: MovementSystem;
  private readonly collision: CollisionSystem;
  private readonly scoring: ScoringSystem;
  private pathfinding: PathfindingSystem;
  private readonly preset: DifficultyPreset;
  private readonly callbacks: GameCallbacks;
  private readonly nextExitTime = new Map<GhostType, number>();

  // Ghost spawn info — used for entity reset
  private readonly ghostSpawnInfo: Record<GhostType, { tile: Vector2D; inHouse: boolean }>;

  private gameTime = 0;
  private totalDots = 0;
  private scatterChaseTimer = 0;
  private scatterChasePhase = 0;
  private isScatterPhase = true;
  private frightenedDuration: number;

  constructor(callbacks: GameCallbacks, difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
    this.preset = DIFFICULTY_PRESETS[difficulty];
    this.callbacks = callbacks;

    this.currentConfig = mazeLoader.getLevel(callbacks.getLevel());

    this.maze = new Maze(this.currentConfig);
    this.pacman = new Pacman(this.currentConfig.pacmanStart.x, this.currentConfig.pacmanStart.y);
    this.blinky = new Blinky(this.currentConfig.ghostStarts.blinky.x, this.currentConfig.ghostStarts.blinky.y);
    const pinky = new Pinky(this.currentConfig.ghostStarts.pinky.x, this.currentConfig.ghostStarts.pinky.y);
    const inky = new Inky(this.currentConfig.ghostStarts.inky.x, this.currentConfig.ghostStarts.inky.y, this.blinky);
    const clyde = new Clyde(this.currentConfig.ghostStarts.clyde.x, this.currentConfig.ghostStarts.clyde.y);

    this.ghosts = [this.blinky, pinky, inky, clyde];

    this.ghostSpawnInfo = {
      [GhostType.BLINKY]: { tile: this.currentConfig.ghostStarts.blinky, inHouse: false },
      [GhostType.PINKY]:  { tile: this.currentConfig.ghostStarts.pinky,  inHouse: true  },
      [GhostType.INKY]:   { tile: this.currentConfig.ghostStarts.inky,   inHouse: true  },
      [GhostType.CLYDE]:  { tile: this.currentConfig.ghostStarts.clyde,  inHouse: true  },
    };

    this.pathfinding = new PathfindingSystem(this.maze);
    this.movement = new MovementSystem(this.maze, this.pathfinding, this.preset);
    this.collision = new CollisionSystem(this.maze);
    this.scoring = new ScoringSystem();

    this.blinky.isInHouse = false;
    this.frightenedDuration = this.preset.frightenedDuration;

    for (const ghost of this.ghosts) {
      this.nextExitTime.set(ghost.ghostType, this.preset.ghostExitDelays[ghost.ghostType]);
    }

    this.applyDifficulty(callbacks.getLevel());
    callbacks.setDotsRemaining(this.maze.getRemainingDots());
    this.totalDots = this.maze.getRemainingDots();
    callbacks.setStatus({ type: 'playing', startTime: Date.now() });
  }

  update(delta: number): void {
    this.gameTime += delta;

    const buffered = inputManager.getBufferedDirection();
    if (buffered !== null) {
      this.pacman.bufferedDirection = buffered;
      inputManager.clearBuffer();
    }

    this.updateScatterChase(delta);
    this.updateGhostHouseExits();

    this.movement.movePacman(this.pacman, delta);
    for (const ghost of this.ghosts) {
      this.movement.moveGhost(ghost, this.pacman, delta);
      ghost.update(delta);
    }
    this.pacman.update(delta);

    this.checkGhostRevival();

    const result = this.collision.check(this.pacman, this.ghosts);

    if (result.ateDot) {
      this.callbacks.addScore(this.scoring.dotScore());
      soundManager.play('chomp');
    }

    if (result.atePellet) {
      this.callbacks.addScore(this.scoring.pelletScore());
      this.callbacks.activatePowerPellet(this.frightenedDuration);
      this.scoring.resetCombo();
      for (const ghost of this.ghosts) {
        if (ghost.mode !== GhostMode.DEAD) {
          ghost.setMode(GhostMode.FRIGHTENED, this.frightenedDuration);
        }
      }
      soundManager.play('pellet');
    }

    if (result.ateGhost !== null) {
      result.ateGhost.setMode(GhostMode.DEAD);
      this.callbacks.addScore(this.scoring.ghostScore());
      soundManager.play('eatGhost');
    }

    if (result.hitGhost) {
      this.callbacks.loseLife();
      if (this.callbacks.getStatus().type === 'game-over') {
        soundManager.play('gameOver');
        return;
      }
      soundManager.play('death');
      this.resetEntities();
    }

    const remaining = this.maze.getRemainingDots();
    this.callbacks.setDotsRemaining(remaining);
    this.updateCruiseElroy(remaining);
    if (remaining === 0) {
      if (this.callbacks.getLevel() >= MAX_LEVELS) {
        soundManager.play('victory');
        this.callbacks.setStatus({ type: 'victory', finalScore: this.callbacks.getScore() });
      } else {
        soundManager.play('levelComplete');
        this.callbacks.nextLevel();
        this.advanceLevel();
      }
    }

    soundManager.updateSirenSpeed(remaining, this.totalDots);
  }

  render(ctx: CanvasRenderingContext2D): void {
    renderer.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT, '#000000');
    const { tileSize, wallColor } = this.currentConfig;
    for (let y = 0; y < this.maze.config.height; y++) {
      for (let x = 0; x < this.maze.config.width; x++) {
        const tile = this.maze.getTile(x, y);
        if (tile) renderer.drawTile(tile, tileSize, wallColor);
      }
    }
    for (const ghost of this.ghosts) ghost.render(ctx);
    this.pacman.render(ctx);
  }

  // ─── Private helpers ───────────────────────────────────────────────

  private resetEntities(): void {
    const ts = this.currentConfig.tileSize;

    // Pac-Man
    const ps = this.currentConfig.pacmanStart;
    this.pacman.position.x = ps.x * ts + ts / 2;
    this.pacman.position.y = ps.y * ts + ts / 2;
    this.pacman.direction = 'NONE';
    this.pacman.bufferedDirection = 'NONE';

    // Ghosts
    for (const ghost of this.ghosts) {
      const info = this.ghostSpawnInfo[ghost.ghostType];
      ghost.position.x = info.tile.x * ts + ts / 2;
      ghost.position.y = info.tile.y * ts + ts / 2;
      ghost.direction = 'NONE';
      ghost.prevDirection = 'NONE';
      ghost.frightenedTimer = 0;
      ghost.lastDecisionTile = null;
      ghost.isInHouse = info.inHouse;
      ghost.setMode(GhostMode.SCATTER);
      if (ghost === this.blinky) this.blinky.resetElroy();
      // Schedule exit relative to current game time
      this.nextExitTime.set(ghost.ghostType, this.gameTime + this.preset.ghostExitDelays[ghost.ghostType]);
    }
  }

  private advanceLevel(): void {
    // Reset game-time so exit delays apply from the level start
    this.gameTime = 0;

    // Load the new level config and rebuild the maze
    this.currentConfig = mazeLoader.getLevel(this.callbacks.getLevel());
    this.maze = new Maze(this.currentConfig);
    this.totalDots = this.maze.getRemainingDots();
    this.pathfinding = new PathfindingSystem(this.maze);
    this.movement.setMaze(this.maze, this.pathfinding);
    this.collision.setMaze(this.maze);

    this.callbacks.setDotsRemaining(this.maze.getRemainingDots());
    this.applyDifficulty(this.callbacks.getLevel());

    this.resetEntities();

    // Restart scatter/chase cycle
    this.scatterChaseTimer = 0;
    this.scatterChasePhase = 0;
    this.isScatterPhase = true;
    this.scoring.resetCombo();
  }

  private applyDifficulty(level: number): void {
    const safeLevel = Math.max(1, level);
    const base = this.preset.ghostBaseSpeed;
    const ghostSpeed = Math.min(base + (safeLevel - 1) * 8, base + 40);
    for (const ghost of this.ghosts) {
      ghost.setBaseSpeed(ghostSpeed);
    }
    // frightenedDuration is fixed by preset — no per-level decay
  }

  private updateScatterChase(delta: number): void {
    if (this.scatterChasePhase >= this.preset.scatterChaseSchedule.length) return;

    this.scatterChaseTimer += delta;
    const phaseDuration = this.preset.scatterChaseSchedule[this.scatterChasePhase] ?? Infinity;

    if (this.scatterChaseTimer >= phaseDuration) {
      this.scatterChaseTimer -= phaseDuration;
      this.scatterChasePhase++;
      this.isScatterPhase = !this.isScatterPhase;
      const newMode = this.isScatterPhase ? GhostMode.SCATTER : GhostMode.CHASE;
      for (const ghost of this.ghosts) {
        if (ghost.mode !== GhostMode.FRIGHTENED && ghost.mode !== GhostMode.DEAD && !ghost.isInHouse) {
          ghost.setMode(newMode);
        }
      }
    }
  }

  private updateGhostHouseExits(): void {
    const ts = this.currentConfig.tileSize;
    for (const ghost of this.ghosts) {
      if (!ghost.isInHouse) continue;
      const exitTime = this.nextExitTime.get(ghost.ghostType) ?? Infinity;
      if (this.gameTime >= exitTime) {
        ghost.isInHouse = false;
        // Teleport to corridor just above the ghost house
        ghost.position.x = 13 * ts + ts / 2;
        ghost.position.y = 11 * ts + ts / 2;
        ghost.direction = 'LEFT';
        ghost.setMode(this.isScatterPhase ? GhostMode.SCATTER : GhostMode.CHASE);
      }
    }
  }

  private updateCruiseElroy(remaining: number): void {
    if (this.blinky.isInHouse || this.blinky.mode === GhostMode.DEAD) return;
    if (remaining <= this.preset.elroyPhase2Dots) {
      this.blinky.setElroyPhase(2);
    } else if (remaining <= this.preset.elroyPhase1Dots) {
      this.blinky.setElroyPhase(1);
    }
  }

  private checkGhostRevival(): void {
    for (const ghost of this.ghosts) {
      if (ghost.mode !== GhostMode.DEAD) continue;
      if (ghost.getTileX() === GHOST_HOUSE_ENTRY.x && ghost.getTileY() === GHOST_HOUSE_ENTRY.y) {
        ghost.isInHouse = true;
        ghost.setMode(GhostMode.SCATTER);
        this.nextExitTime.set(ghost.ghostType, this.gameTime + GHOST_REVIVE_DELAY);
      }
    }
  }
}
