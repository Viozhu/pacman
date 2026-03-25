# Sound System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete Web Audio API–based arcade sound system to the Pac-Man game, with per-sound synthesis, a global volume slider persisted to localStorage, and a speaker icon mute toggle on the Settings page.

**Architecture:** A `SoundManager` singleton (matching the `renderer`/`inputManager` pattern) owns one `AudioContext` and a master `GainNode`. All sounds are synthesized in real time using oscillators and gain envelopes — no audio files. The settings store is updated to replace the boolean toggle with a numeric volume (0–1) persisted via Zustand `persist`.

**Tech Stack:** Web Audio API (native browser), TypeScript, Zustand + Immer, React 19, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-03-25-sound-system-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/engine/core/SoundManager.ts` | All audio synthesis, volume control, siren lifecycle |
| Modify | `src/store/settingsStore.ts` | Replace `soundEnabled` with `volume` + `lastVolume`, add persist |
| Modify | `src/routes/settings.tsx` | Replace toggle with volume slider + speaker icon |
| Modify | `src/engine/core/Game.ts` | Call sound events at the correct update() points |
| Modify | `src/hooks/useGameEngine.ts` | Init sound, play intro, start/stop siren, sync volume |

---

## Task 1: Update settingsStore — replace soundEnabled with volume

**Files:**
- Modify: `src/store/settingsStore.ts`

- [ ] **Step 1: Replace the store contents**

Replace the entire file with:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';

type Difficulty = 'easy' | 'normal' | 'hard';

interface SettingsStoreState {
  volume: number;
  lastVolume: number;
  difficulty: Difficulty;
  setVolume: (v: number) => void;
  mute: () => void;
  unmute: () => void;
  setDifficulty: (d: Difficulty) => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      volume: 0.7,
      lastVolume: 0.7,
      difficulty: 'normal',

      setVolume: (v) =>
        set(
          produce<SettingsStoreState>((draft) => {
            draft.volume = Math.max(0, Math.min(1, v));
          }),
        ),

      mute: () =>
        set(
          produce<SettingsStoreState>((draft) => {
            if (draft.volume > 0) draft.lastVolume = draft.volume;
            draft.volume = 0;
          }),
        ),

      unmute: () =>
        set(
          produce<SettingsStoreState>((draft) => {
            draft.volume = draft.lastVolume > 0 ? draft.lastVolume : 0.7;
          }),
        ),

      setDifficulty: (difficulty) => set({ difficulty }),
    }),
    {
      name: 'pac-man-settings',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const old = persistedState as Record<string, unknown>;
          return {
            volume: old['soundEnabled'] === false ? 0 : 0.7,
            lastVolume: 0.7,
            difficulty: (old['difficulty'] as Difficulty) ?? 'normal',
          };
        }
        return persistedState as Partial<SettingsStoreState>;
      },
    },
  ),
);
```

- [ ] **Step 2: Verify no type errors**

```bash
pnpm tsc --noEmit 2>&1 | head -40
```

Expected: errors only in files that reference the old `soundEnabled` or `toggleSound` (settings.tsx, useGameEngine.ts) — those are fixed in later tasks. Zero errors in settingsStore.ts itself.

- [ ] **Step 3: Commit**

```bash
git add src/store/settingsStore.ts
git commit -m "feat(sound): replace soundEnabled toggle with volume slider in settingsStore"
```

---

## Task 2: Create SoundManager singleton

**Files:**
- Create: `src/engine/core/SoundManager.ts`

- [ ] **Step 1: Create the file**

```typescript
export type SoundEvent =
  | 'chomp'
  | 'pellet'
  | 'eatGhost'
  | 'death'
  | 'intro'
  | 'levelComplete'
  | 'victory'
  | 'gameOver';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sirenOscillator: OscillatorNode | null = null;
  private volume = 0.7;
  private chompToggle = false;
  private visibilityHandler: (() => void) | null = null;

  init(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => undefined);
      if (this.visibilityHandler) {
        document.removeEventListener('visibilitychange', this.visibilityHandler);
      }
    }
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);

    this.visibilityHandler = () => {
      if (!document.hidden && this.ctx?.state === 'suspended') {
        this.ctx.resume().catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  play(sound: SoundEvent): void {
    if (!this.ctx || !this.masterGain) return;
    switch (sound) {
      case 'chomp':        this.playChomp();        break;
      case 'pellet':       this.playPellet();       break;
      case 'eatGhost':     this.playEatGhost();     break;
      case 'death':        this.playDeath();        break;
      case 'intro':        this.playIntro();        break;
      case 'levelComplete':this.playLevelComplete();break;
      case 'victory':      this.playVictory();      break;
      case 'gameOver':     this.playGameOver();     break;
    }
  }

  startSiren(): void {
    if (!this.ctx || !this.masterGain) return;
    this.stopSiren(); // stop any existing siren before creating a new one
    const osc = this.ctx.createOscillator();
    const sirenGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 200;
    sirenGain.gain.value = 0.08;
    osc.connect(sirenGain);
    sirenGain.connect(this.masterGain);
    osc.start();
    this.sirenOscillator = osc;
  }

  stopSiren(): void {
    if (this.sirenOscillator) {
      this.sirenOscillator.stop();
      this.sirenOscillator = null;
    }
  }

  updateSirenSpeed(dotsRemaining: number, totalDots: number): void {
    if (!this.sirenOscillator || !this.ctx) return;
    const ratio = totalDots > 0 ? 1 - dotsRemaining / totalDots : 0;
    const freq = 200 + ratio * 400; // 200Hz (full board) → 600Hz (empty)
    this.sirenOscillator.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
  }

  // ─── Private synthesis helpers ────────────────────────────────────

  private playChomp(): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;
    const freq = this.chompToggle ? 220 : 180;
    this.chompToggle = !this.chompToggle;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  private playPellet(): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
    lfo.frequency.value = 18;
    lfoGain.gain.value = 25;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime);
    lfo.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    lfo.stop(ctx.currentTime + 0.5);
  }

  private playEatGhost(): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  private playDeath(): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;
    // Chromatic descent from B4 to C4
    const notes = [494, 466, 440, 415, 392, 370, 349, 330, 311, 294, 277, 261];
    const dur = 0.125;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * dur;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + dur);
    });
  }

  private playIntro(): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;
    // Classic Pac-Man intro (simplified 4-phrase melody)
    const seq: Array<[number, number]> = [
      [494, 0.15], [988, 0.15], [740, 0.15], [622, 0.30],
      [988, 0.15], [740, 0.15], [622, 0.30],
      [523, 0.15], [1047, 0.15], [784, 0.15], [659, 0.30],
      [1047, 0.15], [784, 0.15], [659, 0.90],
    ];
    let t = ctx.currentTime;
    for (const [freq, dur] of seq) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.85);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  }

  private playLevelComplete(): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;
    const seq: Array<[number, number]> = [
      [523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.2], [784, 0.1], [1047, 0.4],
    ];
    let t = ctx.currentTime;
    for (const [freq, dur] of seq) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.85);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  }

  private playVictory(): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;
    const seq: Array<[number, number]> = [
      [523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.1],
      [784, 0.1], [1047, 0.1], [1319, 0.15],
      [1047, 0.1], [784, 0.1], [659, 0.1],
      [784, 0.1], [1047, 0.3],
      [784, 0.1], [659, 0.1], [523, 0.5],
    ];
    let t = ctx.currentTime;
    for (const [freq, dur] of seq) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.85);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  }

  private playGameOver(): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;
    const seq: Array<[number, number]> = [
      [392, 0.3], [370, 0.3], [349, 0.3], [330, 0.3],
      [311, 0.3], [294, 0.3], [277, 0.5],
    ];
    let t = ctx.currentTime;
    for (const [freq, dur] of seq) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  }
}

export const soundManager = new SoundManager();
```

- [ ] **Step 2: Lint and type check**

```bash
pnpm tsc --noEmit 2>&1 | grep SoundManager
pnpm lint 2>&1 | grep SoundManager
```

Expected: no errors referencing `SoundManager.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/engine/core/SoundManager.ts
git commit -m "feat(sound): add SoundManager singleton with Web Audio API synthesis"
```

---

## Task 3: Update Settings page — volume slider + speaker icon

**Files:**
- Modify: `src/routes/settings.tsx`

- [ ] **Step 1: Replace the SOUND section**

In `src/routes/settings.tsx`, replace the entire `soundEnabled` import usage and the Sound toggle section. The new imports needed at the top:

```typescript
import { soundManager } from '@/engine/core/SoundManager';
```

Replace `const { soundEnabled, difficulty, toggleSound, setDifficulty } = useSettingsStore();` with:

```typescript
const { volume, difficulty, setVolume, mute, unmute, setDifficulty } = useSettingsStore();
```

Replace the entire `{/* Sound toggle */}` section with:

```tsx
{/* Sound */}
<section className="mb-6">
  <div className="flex items-center justify-between mb-2">
    <span className="text-white text-[11px] tracking-wider">SOUND</span>
    <button
      onClick={() => {
        if (volume > 0) {
          mute();
          soundManager.setVolume(0);
        } else {
          unmute();
          // unmute() has already updated volume in the store — read it back
          soundManager.setVolume(useSettingsStore.getState().volume);
        }
      }}
      aria-label={volume > 0 ? 'Mute sound' : 'Unmute sound'}
      className="text-[#555] hover:text-white transition-colors text-[14px] leading-none"
    >
      {volume > 0 ? '🔊' : '🔇'}
    </button>
  </div>
  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    value={volume}
    onChange={(e) => {
      const v = parseFloat(e.target.value);
      setVolume(v);
      soundManager.setVolume(v);
    }}
    className="w-full accent-[#ffd700] cursor-pointer"
    aria-label="Volume"
  />
  <p className="text-[9px] text-[#333] mt-1 tracking-wider">
    {volume === 0 ? 'MUTED' : `${Math.round(volume * 100)}%`}
  </p>
</section>
```

- [ ] **Step 2: Lint and type check**

```bash
pnpm tsc --noEmit 2>&1 | grep settings
pnpm lint 2>&1 | grep settings
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/settings.tsx
git commit -m "feat(sound): replace settings sound toggle with volume slider and mute button"
```

---

## Task 4: Update Game.ts — fire sound events

**Files:**
- Modify: `src/engine/core/Game.ts`

- [ ] **Step 1: Add import and totalDots field**

At the top of `src/engine/core/Game.ts`, add after the existing imports:

```typescript
import { soundManager } from '@/engine/core/SoundManager';
```

In the class body, add a private field after `private gameTime = 0;`:

```typescript
private totalDots = 0;
```

In the constructor, after `callbacks.setDotsRemaining(this.maze.getRemainingDots());`, add:

```typescript
this.totalDots = this.maze.getRemainingDots();
```

- [ ] **Step 2: Add sound calls in update()**

In the `update()` method, modify the collision handling section. All additions go **inside** the existing `if` blocks (before their closing brace):

Inside `if (result.ateDot) {` add before `}`:
```typescript
  soundManager.play('chomp');
```

Inside `if (result.atePellet) {` add before `}`:
```typescript
  soundManager.play('pellet');
```

Inside `if (result.ateGhost !== null) {` add before `}`:
```typescript
  soundManager.play('eatGhost');
```

Replace the `if (result.hitGhost) {` block:
```typescript
if (result.hitGhost) {
  this.callbacks.loseLife();
  if (this.callbacks.getStatus().type === 'game-over') {
    soundManager.play('gameOver');
    return;
  }
  soundManager.play('death');
  this.resetEntities();
}
```

Replace the `if (remaining === 0) {` block:
```typescript
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
```

At the very end of `update()`, before the closing brace, add:

```typescript
soundManager.updateSirenSpeed(remaining, this.totalDots);
```

- [ ] **Step 3: Update totalDots in advanceLevel()**

In `advanceLevel()`, insert immediately after `this.maze = new Maze(this.currentConfig);` and before the existing `this.pathfinding = new PathfindingSystem(this.maze);` line:

```typescript
this.totalDots = this.maze.getRemainingDots();
```

- [ ] **Step 4: Lint and type check**

```bash
pnpm tsc --noEmit 2>&1 | grep -E "Game\.ts|SoundManager"
pnpm lint 2>&1 | grep Game
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/engine/core/Game.ts
git commit -m "feat(sound): wire sound events into Game update loop"
```

---

## Task 5: Update useGameEngine — init, siren, volume subscription

**Files:**
- Modify: `src/hooks/useGameEngine.ts`

- [ ] **Step 1: Add soundManager import and volume subscription**

At the top of `src/hooks/useGameEngine.ts`, add:

```typescript
import { soundManager } from '@/engine/core/SoundManager';
```

Replace `export function useGameEngine(canvasRef: RefObject<HTMLCanvasElement | null>): void {` and the body with:

```typescript
export function useGameEngine(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  const addScore = useGameStore((s) => s.addScore);
  const loseLife = useGameStore((s) => s.loseLife);
  const setStatus = useGameStore((s) => s.setStatus);
  const setDotsRemaining = useGameStore((s) => s.setDotsRemaining);
  const activatePowerPellet = useGameStore((s) => s.activatePowerPellet);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const reset = useGameStore((s) => s.reset);
  const isPaused = useUiStore((s) => s.isPaused);
  const volume = useSettingsStore((s) => s.volume);

  // Sync volume to SoundManager whenever it changes
  useEffect(() => {
    soundManager.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    reset();
    renderer.init(canvas);
    inputManager.init();
    soundManager.init();
    soundManager.play('intro');

    const callbacks: GameCallbacks = {
      addScore,
      loseLife,
      setStatus,
      setDotsRemaining,
      activatePowerPellet,
      nextLevel,
      getStatus: () => useGameStore.getState().status,
      getScore: () => useGameStore.getState().score,
      getLevel: () => useGameStore.getState().level,
    };

    const difficulty = useSettingsStore.getState().difficulty;
    const game = new Game(callbacks, difficulty);

    gameLoop.start(
      (delta: number) => {
        game.update(delta);
        const { status } = useGameStore.getState();
        if (status.type === 'game-over' || status.type === 'victory') {
          gameLoop.stop();
          soundManager.stopSiren();
        }
      },
      () => game.render(ctx),
    );

    soundManager.startSiren();

    return () => {
      gameLoop.stop();
      inputManager.destroy();
      soundManager.stopSiren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // Pause / resume when isPaused changes (after initial mount)
  useEffect(() => {
    if (isPaused) gameLoop.pause();
    else gameLoop.resume();
  }, [isPaused]);
}
```

- [ ] **Step 2: Lint and type check the whole project**

```bash
pnpm tsc --noEmit
pnpm lint
```

Expected: zero errors and zero warnings.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGameEngine.ts
git commit -m "feat(sound): init SoundManager in useGameEngine, wire siren and volume sync"
```

---

## Task 6: Manual verification

No automated tests are available in this project. Verify by running the dev server.

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

Navigate to `http://localhost:3000`.

- [ ] **Step 2: Verify Settings page**

- Open Settings → Sound section shows a horizontal slider (not a toggle)
- Drag slider → percentage label updates (e.g., "70%")
- Click speaker icon → label shows "MUTED", slider goes to 0
- Click speaker icon again → volume restores to previous value
- Refresh page → volume slider position is preserved (localStorage)

- [ ] **Step 3: Verify in-game sounds**

- Start a game → intro melody plays (~4 seconds, 4-phrase arcade tune)
- Move Pac-Man over dots → alternating low/high chomp sounds
- Eat a power pellet → descending vibrato sound
- Eat a frightened ghost → ascending blip
- Get caught by ghost (with lives remaining) → descending chromatic death sequence
- Run out of lives → slow descending game-over melody
- Clear all dots on a non-final level → short ascending jingle
- Clear all dots on level 5 → longer triumphant victory melody
- Siren hum is audible during gameplay and audibly speeds up as fewer dots remain

- [ ] **Step 4: Final commit (if any cleanup needed)**

```bash
git add -p
git commit -m "fix(sound): <describe any fixes>"
```
