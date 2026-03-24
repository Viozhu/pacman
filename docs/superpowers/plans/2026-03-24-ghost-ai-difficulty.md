# Ghost AI & Difficulty System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace greedy ghost pathfinding with BFS and wire the existing `difficulty` setting into the game engine via three `DifficultyPreset` configs.

**Architecture:** A new `DifficultyPreset` type centralizes all AI parameters (speed, frightened duration, scatter schedule, exit delays, error rate, Elroy thresholds). `MovementSystem` receives the preset and uses `PathfindingSystem.nextStep` (BFS) instead of greedy Euclidean distance. `Game` resolves the preset from the difficulty string and removes all hardcoded constants. `useGameEngine` reads difficulty from `settingsStore.getState()` and passes it to `new Game()`.

**Tech Stack:** TypeScript (strict, `verbatimModuleSyntax`, `erasableSyntaxOnly`), Zustand, no test runner — verify with `pnpm lint` and `pnpm tsc --noEmit`.

**Spec:** `docs/superpowers/specs/2026-03-24-ghost-ai-difficulty-design.md`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/types/game.types.ts` | Modify | Replace unused `DifficultyConfig` with `DifficultyPreset` + `DIFFICULTY_PRESETS` constant |
| `src/engine/systems/MovementSystem.ts` | Modify | Accept `DifficultyPreset`, BFS in `pickDirection`, add `randomValidDirection`, handle `'NONE'` |
| `src/engine/core/Game.ts` | Modify | Accept `difficulty` param, resolve preset, replace all hardcoded constants, fix `applyDifficulty` + `resetEntities` |
| `src/hooks/useGameEngine.ts` | Modify | Read difficulty from store, pass to `new Game()` |

---

## Task 1: Add DifficultyPreset type and presets

**Files:**
- Modify: `src/types/game.types.ts`

> **Context:** `GhostType` is imported from `@/types/entities.types`. The existing `DifficultyConfig` interface (lines 31–37) is unused — replace it entirely. Use `import type` for type-only imports (verbatimModuleSyntax is on). No enums — use `const` objects (erasableSyntaxOnly is on).

- [ ] **Step 1: Replace DifficultyConfig with DifficultyPreset in `src/types/game.types.ts`**

Remove lines 30–37 (the old `DifficultyConfig` block) and replace with:

```ts
import type { GhostType } from '@/types/entities.types';

// Difficulty Preset — controls all AI and pacing parameters per difficulty level
export interface DifficultyPreset {
  ghostBaseSpeed: number;                     // px/s — base speed for level 1
  frightenedDuration: number;                 // ms — fixed, no per-level decay
  scatterChaseSchedule: readonly number[];    // alternating scatter/chase ms; Infinity = forever
  ghostExitDelays: Record<GhostType, number>; // ms after level/life-reset before ghost exits house
  errorRate: number;                          // 0–1: chance of random direction instead of BFS optimal
  elroyPhase1Dots: number;
  elroyPhase2Dots: number;
}

export const DIFFICULTY_PRESETS: Record<'easy' | 'normal' | 'hard', DifficultyPreset> = {
  easy: {
    ghostBaseSpeed: 95,
    frightenedDuration: 12000,
    scatterChaseSchedule: [7000, 20000, 3000, 20000, 1000, Infinity],
    ghostExitDelays: { BLINKY: 0, PINKY: 0, INKY: 2500, CLYDE: 5000 },
    errorRate: 0.20,
    elroyPhase1Dots: 15,
    elroyPhase2Dots: 8,
  },
  normal: {
    ghostBaseSpeed: 120,
    frightenedDuration: 8000,
    scatterChaseSchedule: [3000, 20000, 3000, 20000, 1000, Infinity],
    ghostExitDelays: { BLINKY: 0, PINKY: 0, INKY: 1500, CLYDE: 3000 },
    errorRate: 0,
    elroyPhase1Dots: 20,
    elroyPhase2Dots: 10,
  },
  hard: {
    ghostBaseSpeed: 145,
    frightenedDuration: 4000,
    scatterChaseSchedule: [2000, 25000, 2000, 25000, 1000, Infinity],
    ghostExitDelays: { BLINKY: 0, PINKY: 0, INKY: 0, CLYDE: 0 },
    errorRate: 0,
    elroyPhase1Dots: 30,
    elroyPhase2Dots: 15,
  },
};
```

> **Important:** The `import type { GhostType }` must be added at the top of the file alongside any existing imports. Place it before the `DifficultyPreset` interface.

- [ ] **Step 2: Verify types compile**

```bash
pnpm tsc --noEmit
```

Expected: zero errors. If you see "Cannot find name 'GhostType'" ensure the import is at the top of the file.

- [ ] **Step 3: Commit**

```bash
git add src/types/game.types.ts
git commit -m "feat: add DifficultyPreset type and easy/normal/hard presets"
```

---

## Task 2: Update MovementSystem — BFS pathfinding + errorRate

**Files:**
- Modify: `src/engine/systems/MovementSystem.ts`

> **Context:** `MovementSystem` currently has a `pickDirection` method that uses greedy Euclidean distance (lines 99–122) and a `randomAdjacentTile` method (lines 124–138). The `PathfindingSystem.nextStep(from, to)` method already exists and returns a `Direction` (including `'NONE'` when no path is found). `GhostMode` is imported from `@/types/entities.types`. `DIFFICULTY_PRESETS` is not needed here — the caller passes the resolved `DifficultyPreset` object.

- [ ] **Step 1: Update the constructor to accept DifficultyPreset**

Add the import at the top of `src/engine/systems/MovementSystem.ts`:

```ts
import type { DifficultyPreset } from '@/types/game.types';
```

Change the constructor signature and add a private field:

```ts
private readonly preset: DifficultyPreset;

constructor(maze: Maze, pathfinding: PathfindingSystem, preset: DifficultyPreset) {
  this.maze = maze;
  this.pathfinding = pathfinding;
  this.preset = preset;
}
```

- [ ] **Step 2: Replace pickDirection with BFS + errorRate**

Replace the existing `pickDirection` method (lines 99–122) entirely:

```ts
private pickDirection(ghost: Ghost, target: Vector2D): Direction {
  const currentTile = new Vector2D(ghost.getTileX(), ghost.getTileY());
  const bfsDir = this.pathfinding.nextStep(currentTile, target);

  // errorRate only applies in CHASE/SCATTER — FRIGHTENED already uses a
  // random target tile so adding errorRate would double-randomize.
  // DEAD must always take the optimal path home.
  const applyError =
    this.preset.errorRate > 0 &&
    ghost.mode !== GhostMode.FRIGHTENED &&
    ghost.mode !== GhostMode.DEAD;

  if (applyError && Math.random() < this.preset.errorRate) {
    const randomDir = this.randomValidDirection(ghost);
    if (randomDir !== null) return randomDir;
  }

  // BFS returns 'NONE' when from===to or no path exists — fall back so
  // the ghost doesn't freeze.
  if (bfsDir === 'NONE') {
    return this.randomValidDirection(ghost) ?? 'NONE';
  }

  return bfsDir;
}
```

> **Note:** `GhostMode` must be imported. Check the existing imports at the top of the file — it should already be there via `import { GhostMode } from '@/types/entities.types'`. If not, add it.

- [ ] **Step 3: Add randomValidDirection method**

Add this new private method alongside `randomAdjacentTile` (keep `randomAdjacentTile` — it is still used by FRIGHTENED mode in `moveGhost`):

```ts
private randomValidDirection(ghost: Ghost): Direction | null {
  const tx = ghost.getTileX();
  const ty = ghost.getTileY();
  const forbidden = OPPOSITE_DIRECTION[ghost.direction];

  const valid = DIRECTIONS.filter((dir) => {
    if (dir === forbidden) return false;
    const vec = DIRECTION_VECTORS[dir];
    return this.maze.isWalkable(tx + vec.x, ty + vec.y);
  });

  if (valid.length === 0) return null;
  return valid[Math.floor(Math.random() * valid.length)]!;
}
```

- [ ] **Step 4: Verify types compile**

```bash
pnpm tsc --noEmit
```

Expected: zero errors. Common issue: `GhostMode` not imported — add `import { GhostMode } from '@/types/entities.types'` if missing.

- [ ] **Step 5: Commit**

```bash
git add src/engine/systems/MovementSystem.ts
git commit -m "feat: replace greedy ghost pathfinding with BFS + difficulty errorRate"
```

---

## Task 3: Update Game.ts — accept difficulty, use preset everywhere

**Files:**
- Modify: `src/engine/core/Game.ts`

> **Context:** `Game.ts` currently has hardcoded constants `SCATTER_CHASE_SCHEDULE`, `GHOST_INITIAL_EXIT`, `ELROY_PHASE1_DOTS`, `ELROY_PHASE2_DOTS` at the top of the file, and `this.frightenedDuration = 8000` in the constructor. `applyDifficulty` applies per-level frightened decay — that formula is removed. `resetEntities` uses `GHOST_INITIAL_EXIT` — update to use `this.preset`. The `MovementSystem` constructor now requires a third argument (the preset).

- [ ] **Step 1: Add import and update class fields in Game.ts**

Add to imports at the top:

```ts
import { DIFFICULTY_PRESETS } from '@/types/game.types';
import type { DifficultyPreset } from '@/types/game.types';
```

Add a private field to the class:

```ts
private readonly preset: DifficultyPreset;
```

- [ ] **Step 2: Update the constructor signature and resolve preset**

Change the constructor signature:

```ts
constructor(callbacks: GameCallbacks, difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
```

As the first line of the constructor body, resolve the preset:

```ts
this.preset = DIFFICULTY_PRESETS[difficulty];
```

- [ ] **Step 3: Replace hardcoded constants with preset values**

At the top of `Game.ts`, remove these module-level constants (they are replaced by the preset):

```ts
// DELETE these lines:
const SCATTER_CHASE_SCHEDULE: readonly number[] = [
  3000, 20000, 3000, 20000, 1000, Infinity,
];

const GHOST_INITIAL_EXIT: Record<GhostType, number> = {
  [GhostType.BLINKY]: 0,
  [GhostType.PINKY]: 0,
  [GhostType.INKY]: 5000,
  [GhostType.CLYDE]: 10000,
};

const ELROY_PHASE2_DOTS = 10;
const ELROY_PHASE1_DOTS = 20;
```

And in the constructor, replace:

```ts
// OLD:
this.frightenedDuration = 8000;

// NEW:
this.frightenedDuration = this.preset.frightenedDuration;
```

Replace the `MovementSystem` instantiation (pass `this.preset` as third arg):

```ts
// OLD:
const pathfinding = new PathfindingSystem(this.maze);
this.movement = new MovementSystem(this.maze, pathfinding);

// NEW:
const pathfinding = new PathfindingSystem(this.maze);
this.movement = new MovementSystem(this.maze, pathfinding, this.preset);
```

Replace the initial ghost exit scheduling loop:

```ts
// OLD:
for (const ghost of this.ghosts) {
  this.nextExitTime.set(ghost.ghostType, GHOST_INITIAL_EXIT[ghost.ghostType]);
}

// NEW:
for (const ghost of this.ghosts) {
  this.nextExitTime.set(ghost.ghostType, this.preset.ghostExitDelays[ghost.ghostType]);
}
```

- [ ] **Step 4: Fix updateScatterChase to use preset schedule**

Find `updateScatterChase` and replace the reference to the deleted constant:

```ts
// OLD:
const phaseDuration = SCATTER_CHASE_SCHEDULE[this.scatterChasePhase] ?? Infinity;

// NEW:
const phaseDuration = this.preset.scatterChaseSchedule[this.scatterChasePhase] ?? Infinity;
```

Also update the guard at the top of the method:

```ts
// OLD:
if (this.scatterChasePhase >= SCATTER_CHASE_SCHEDULE.length) return;

// NEW:
if (this.scatterChasePhase >= this.preset.scatterChaseSchedule.length) return;
```

- [ ] **Step 5: Fix updateCruiseElroy to use preset thresholds**

```ts
// OLD:
if (remaining <= ELROY_PHASE2_DOTS) {
  this.blinky.setElroyPhase(2);
} else if (remaining <= ELROY_PHASE1_DOTS) {
  this.blinky.setElroyPhase(1);
}

// NEW:
if (remaining <= this.preset.elroyPhase2Dots) {
  this.blinky.setElroyPhase(2);
} else if (remaining <= this.preset.elroyPhase1Dots) {
  this.blinky.setElroyPhase(1);
}
```

- [ ] **Step 6: Fix applyDifficulty — remove frightened decay, use preset base speed**

Replace the entire `applyDifficulty` method:

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

- [ ] **Step 7: Fix resetEntities to use preset exit delays**

In `resetEntities`, find the line that schedules ghost exits after a life loss:

```ts
// OLD:
this.nextExitTime.set(ghost.ghostType, this.gameTime + GHOST_INITIAL_EXIT[ghost.ghostType]);

// NEW:
this.nextExitTime.set(ghost.ghostType, this.gameTime + this.preset.ghostExitDelays[ghost.ghostType]);
```

- [ ] **Step 8: Verify types compile**

```bash
pnpm tsc --noEmit
```

Expected: zero errors. Common issues:
- "Cannot find name 'SCATTER_CHASE_SCHEDULE'" — check you deleted all references
- "Expected 3 arguments, but got 2" on MovementSystem — check step 3 above

- [ ] **Step 9: Run linter**

```bash
pnpm lint
```

Expected: zero errors. **Do NOT remove the `import { GhostMode, GhostType }` import** — `GhostType` is still used as a runtime value in `ghostSpawnInfo` computed property keys (`[GhostType.BLINKY]`, etc.) and must remain a value import (not `import type`).

- [ ] **Step 10: Commit**

```bash
git add src/engine/core/Game.ts
git commit -m "feat: wire difficulty preset into Game — replace all hardcoded AI constants"
```

---

## Task 4: Update useGameEngine — pass difficulty to Game

**Files:**
- Modify: `src/hooks/useGameEngine.ts`

> **Context:** `useGameEngine` creates `new Game(callbacks)` inside a `useEffect`. We need to read `difficulty` from `settingsStore` and pass it. Use `useSettingsStore.getState().difficulty` (not the hook) — the game is instantiated once at mount, and we don't want re-instantiation if the user changes difficulty during a game.

- [ ] **Step 1: Add settingsStore import and pass difficulty**

Add import at the top of `src/hooks/useGameEngine.ts`:

```ts
import { useSettingsStore } from '@/store/settingsStore';
```

Inside the `useEffect`, before `new Game(callbacks)`:

```ts
// OLD:
const game = new Game(callbacks);

// NEW:
const difficulty = useSettingsStore.getState().difficulty;
const game = new Game(callbacks, difficulty);
```

- [ ] **Step 2: Verify types compile**

```bash
pnpm tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Run linter**

```bash
pnpm lint
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGameEngine.ts
git commit -m "feat: pass difficulty from settings store to Game engine"
```

---

## Final Verification

- [ ] **Run both checks one last time**

```bash
pnpm tsc --noEmit && pnpm lint
```

Expected: zero errors from both.

- [ ] **Manual smoke test** (requires `pnpm dev` — needs Node 20.19+ or 22.12+)

1. Go to Settings → set difficulty to **Easy** → Start Game. Observe ghosts are slower and occasionally make wrong turns at intersections.
2. Go to Settings → set difficulty to **Normal** → Start Game. Ghosts navigate precisely, feel harder than Easy.
3. Go to Settings → set difficulty to **Hard** → Start Game. All 4 ghosts exit the house immediately or very quickly. Power pellet lasts only ~4 seconds. Ghosts are fast and relentless.
4. Eat a ghost, let it return to the house, confirm it exits again (DEAD mode BFS still works).
5. Eat a power pellet, confirm ghosts move randomly while frightened (not chasing).
6. Lose a life → ghost exit delays on the next attempt match the current difficulty.
