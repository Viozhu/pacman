# Ghost AI & Difficulty System — Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

Replace the current greedy Euclidean ghost pathfinding with BFS-based pathfinding, and wire the existing `difficulty` setting from `settingsStore` into the game engine. The result is a unified `DifficultyPreset` that controls all ghost AI parameters across three presets: Easy, Normal, and Hard.

---

## Problem Statement

1. **Poor pathfinding:** `MovementSystem.pickDirection` uses greedy Euclidean distance to pick the next step. In a maze with walls, this causes ghosts to take suboptimal routes — appearing "dumb" even though their target logic (Blinky, Pinky, Inky, Clyde personalities) is correct.
2. **Disconnected difficulty:** `settingsStore` already has `difficulty: 'easy' | 'normal' | 'hard'` and the Settings UI is functional, but the value is never read by the game engine — all games run with hardcoded parameters.

---

## Architecture

```
settingsStore.difficulty ('easy' | 'normal' | 'hard')
        ↓
useGameEngine  — reads difficulty via getState() at mount time
        ↓
new Game(callbacks, difficulty)
        ↓
DIFFICULTY_PRESETS[difficulty]  — new preset object in game.types.ts
        ↓
MovementSystem(maze, pathfinding, preset)
        ↓
pickDirection() — BFS via PathfindingSystem + errorRate
```

Difficulty is snapshotted at game-start. Changing it mid-game has no effect until the next game — intentional behavior.

---

## DifficultyPreset Type

The existing `DifficultyConfig` interface in `src/types/game.types.ts` (lines 31–37) is unused — no file outside that module imports it. It is replaced entirely with the new `DifficultyPreset` type:

```ts
// Replaces the old unused DifficultyConfig
export interface DifficultyPreset {
  ghostBaseSpeed: number;                        // px/s — base speed for level 1
  frightenedDuration: number;                    // ms — fixed per difficulty, no per-level decay
  scatterChaseSchedule: readonly number[];       // alternating scatter/chase durations in ms; use Infinity for "forever"
  ghostExitDelays: Record<GhostType, number>;    // ms after level/life-reset before ghost exits house
  errorRate: number;                             // 0–1: probability of random direction instead of BFS optimal
  elroyPhase1Dots: number;
  elroyPhase2Dots: number;
}
```

> **Note on `frightenedDuration`:** The existing `applyDifficulty` method applies a per-level decay formula (`8000 - (level-1)*1000`). This formula is removed. `frightenedDuration` is now fixed by the preset and does not change across levels.

> **Note on `scatterChaseSchedule`:** The final phase value must be `Infinity` (JavaScript's built-in `Infinity`), matching the existing constant `SCATTER_CHASE_SCHEDULE`. Not `-1`, not `Number.MAX_SAFE_INTEGER`.

### Presets

| Parameter | Easy | Normal | Hard |
|---|---|---|---|
| `ghostBaseSpeed` | 95 px/s | 120 px/s | 145 px/s |
| `frightenedDuration` | 12 000 ms | 8 000 ms | 4 000 ms |
| `scatterChaseSchedule` | [7000, 20000, 3000, 20000, 1000, Infinity] | [3000, 20000, 3000, 20000, 1000, Infinity] | [2000, 25000, 2000, 25000, 1000, Infinity] |
| Exit delay — Blinky | 0 ms | 0 ms | 0 ms |
| Exit delay — Pinky | 0 ms | 0 ms | 0 ms |
| Exit delay — Inky | 2 500 ms | 1 500 ms | 0 ms |
| Exit delay — Clyde | 5 000 ms | 3 000 ms | 0 ms |
| `errorRate` | 0.20 | 0.00 | 0.00 |
| `elroyPhase1Dots` | 15 | 20 | 30 |
| `elroyPhase2Dots` | 8 | 10 | 15 |

**Easy `errorRate` = 0.20:** At each intersection decision (non-FRIGHTENED, non-DEAD mode), there is a 20% chance the ghost takes a random valid (non-reverse) direction instead of the BFS-optimal one. See `pickDirection` spec below for exact application.

---

## MovementSystem Changes

### Constructor

```ts
constructor(maze: Maze, pathfinding: PathfindingSystem, preset: DifficultyPreset)
```

The `preset` is stored as a private field and referenced in `pickDirection`.

### pickDirection (core change)

**Before:** greedy Euclidean — picks the neighbor tile with smallest Euclidean distance to target.

**After:** BFS + optional error, with explicit handling of edge cases:

```ts
private pickDirection(ghost: Ghost, target: Vector2D): Direction {
  const currentTile = new Vector2D(ghost.getTileX(), ghost.getTileY());
  const bfsDir = this.pathfinding.nextStep(currentTile, target);

  // errorRate only applies in non-FRIGHTENED, non-DEAD modes.
  // FRIGHTENED already uses a random target, so adding errorRate would
  // double-randomize. DEAD must always take optimal path home.
  const applyError =
    this.preset.errorRate > 0 &&
    ghost.mode !== GhostMode.FRIGHTENED &&
    ghost.mode !== GhostMode.DEAD;

  if (applyError && Math.random() < this.preset.errorRate) {
    const randomDir = this.randomValidDirection(ghost);
    if (randomDir !== null) return randomDir;
  }

  // BFS returns 'NONE' when from===to or no path exists.
  // Fall back to randomValidDirection so the ghost doesn't freeze.
  if (bfsDir === 'NONE') {
    return this.randomValidDirection(ghost) ?? 'NONE';
  }

  return bfsDir;
}
```

### randomValidDirection (replaces randomAdjacentTile for this use)

```ts
private randomValidDirection(ghost: Ghost): Direction | null {
  const forbidden = OPPOSITE_DIRECTION[ghost.direction];
  const valid = DIRECTIONS.filter(dir => {
    if (dir === forbidden) return false;
    const vec = DIRECTION_VECTORS[dir];
    return this.maze.isWalkable(ghost.getTileX() + vec.x, ghost.getTileY() + vec.y);
  });
  if (valid.length === 0) return null;
  return valid[Math.floor(Math.random() * valid.length)]!;
}
```

**FRIGHTENED mode:** `moveGhost` calls `pickDirection(ghost, randomAdjacentTile(ghost))`. Because the target is already a random adjacent tile, and because `errorRate` is explicitly skipped for FRIGHTENED mode, behavior is unchanged — the ghost moves randomly as before.

**DEAD mode:** unchanged — `moveGhost` calls `pathfinding.nextStep` directly for DEAD mode, bypassing `pickDirection`.

---

## Game.ts Changes

### Constructor signature

```ts
constructor(callbacks: GameCallbacks, difficulty: 'easy' | 'normal' | 'hard' = 'normal')
```

The preset is resolved immediately: `const preset = DIFFICULTY_PRESETS[difficulty]`.

### Replaced hardcoded constants

| Hardcoded constant / value | Replaced by |
|---|---|
| `SCATTER_CHASE_SCHEDULE = [3000, 20000, ...]` | `preset.scatterChaseSchedule` |
| `GHOST_INITIAL_EXIT = { BLINKY: 0, ..., CLYDE: 10000 }` | `preset.ghostExitDelays` |
| `this.frightenedDuration = 8000` | `preset.frightenedDuration` |
| Per-level frightened decay in `applyDifficulty` | Removed entirely |
| `ELROY_PHASE1_DOTS = 20` | `preset.elroyPhase1Dots` |
| `ELROY_PHASE2_DOTS = 10` | `preset.elroyPhase2Dots` |

### applyDifficulty

Per-level ghost speed scaling is retained but based on `preset.ghostBaseSpeed`:

```ts
private applyDifficulty(level: number): void {
  const safeLevel = Math.max(1, level);
  const base = this.preset.ghostBaseSpeed;
  const ghostSpeed = Math.min(base + (safeLevel - 1) * 8, base + 40);
  for (const ghost of this.ghosts) {
    ghost.setBaseSpeed(ghostSpeed);
  }
  // frightenedDuration is fixed by preset — no per-level decay
}
```

### resetEntities

`resetEntities` currently uses `GHOST_INITIAL_EXIT[ghost.ghostType]` at line 215. This is updated to use `preset.ghostExitDelays[ghost.ghostType]` so life-loss re-exits also respect the difficulty config.

---

## useGameEngine.ts Changes

```ts
const difficulty = useSettingsStore.getState().difficulty;
const game = new Game(callbacks, difficulty);
```

`getState()` is used (not the hook) because `Game` is instantiated once in a `useEffect` — re-reading a reactive value here would cause unnecessary re-instantiation.

---

## Ghost Personalities (unchanged)

The four ghost personalities remain identical in their target logic. The improvement comes entirely from BFS replacing greedy in `pickDirection`:

- **Blinky:** targets Pac-Man's exact tile → BFS always takes shortest path
- **Pinky:** targets 4 tiles ahead of Pac-Man → BFS makes ambush actually work
- **Inky:** pincer using Blinky's position → BFS makes flanking effective
- **Clyde:** chases if >8 tiles away, scatters if close → BFS makes approach/retreat crisp

---

## Files Modified

| File | Change |
|---|---|
| `src/types/game.types.ts` | Replace unused `DifficultyConfig` with `DifficultyPreset` type + `DIFFICULTY_PRESETS` constant |
| `src/engine/systems/MovementSystem.ts` | Accept `DifficultyPreset`, replace `pickDirection` with BFS + errorRate (skipped for FRIGHTENED/DEAD), add `randomValidDirection`, handle BFS `'NONE'` return |
| `src/engine/core/Game.ts` | Accept `difficulty` param, resolve `DifficultyPreset`, replace all hardcoded constants, update `applyDifficulty` and `resetEntities` |
| `src/hooks/useGameEngine.ts` | Read `difficulty` from `useSettingsStore.getState()`, pass to `new Game()` |

No new files are created.

---

## Verification

After implementation, run `pnpm lint` and `pnpm tsc --noEmit` — both must pass with zero errors.

Manual acceptance criteria:

1. **Settings → difficulty change is respected:** Change difficulty in Settings, start a new game, observe ghost behavior differs. Mid-game changes have no effect.
2. **Easy:** Over ~30 seconds of play, at least some ghosts visibly take a suboptimal turn at an intersection (the 20% error rate makes this observable). Ghosts feel slower and less threatening than Normal.
3. **Normal:** Ghosts take optimal paths to their targets. Feels clearly harder than Easy — ghosts corner more accurately.
4. **Hard:** Ghosts are notably faster, power pellet duration is short (4s), and ghosts leave the house quickly. Elroy activates early (30 dots remaining).
5. **DEAD mode unaffected:** A ghost that is eaten still navigates back to the ghost house correctly on all difficulty levels.
6. **FRIGHTENED mode unaffected:** Frightened ghosts still move randomly (not optimally toward any target).
7. **Life loss re-exit:** After losing a life, ghost exit delays match the current difficulty preset.
