# UI Redesign — Retro Arcade CRT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all Pac-Man game UI screens to a Full CRT Retro Arcade aesthetic using Press Start 2P font, scanlines, phosphor glow, and occasional screen flicker.

**Architecture:** A global `CRTWrapper` component applied at the router root adds scanlines/flicker/vignette via CSS pseudo-elements. Individual screens are updated file-by-file with retro color classes and inline glow styles. No logic or routing changes — only visual layer.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Press Start 2P (Google Fonts), CSS keyframe animations in `src/index.css`

**Verification:** No UI test framework exists. After each task run `pnpm lint` and `pnpm tsc --noEmit` to catch type errors. Verify visually in the browser at `http://localhost:3000`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `index.html` | Modify | Add Google Fonts `<link>` tags |
| `src/index.css` | Modify | Add `flicker`, `glow-pulse` keyframes + `.crt-wrapper` class; update `body` in `@layer base` |
| `src/components/ui/CRTWrapper.tsx` | **Create** | Renders `<div className="crt-wrapper">{children}</div>` |
| `src/router.tsx` | Modify | Replace root `<div>` wrapper with `<CRTWrapper>` |
| `src/routes/index.tsx` | Modify | Full Home page visual update |
| `src/components/game/GameHUD.tsx` | Modify | Structural 3-column refactor + retro styles |
| `src/components/game/PauseMenu.tsx` | Modify | Retro styles only |
| `src/routes/game.tsx` | Modify | `GameOverOverlay` JSX retro styles |
| `src/routes/high-scores.tsx` | Modify | Retro layout + loading/empty states |
| `src/components/leaderboard/HighScoresTable.tsx` | Modify | Retro cell styles + rank colors |
| `src/routes/settings.tsx` | Modify | Retro styles only |

---

## Task 1: Foundation — Fonts, CSS Animations, CRTWrapper

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Create: `src/components/ui/CRTWrapper.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: Add Google Fonts to `index.html`**

  Insert these three `<link>` tags inside `<head>`, after the existing `<link rel="icon">` line:

  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  ```

- [ ] **Step 2: Add CRT keyframes and `.crt-wrapper` class to `src/index.css`**

  Append the following **after** the last `@layer base` block (the one ending with `}` that contains the `body { @apply bg-background text-foreground; }` rule):

  ```css
  @keyframes flicker {
    0%, 89%  { opacity: 1; }
    90%       { opacity: 0.94; }
    91%       { opacity: 1; }
    94%       { opacity: 0.97; }
    95%, 100% { opacity: 1; }
  }

  @keyframes glow-pulse {
    0%, 100% { text-shadow: 0 0 8px #ffd700, 0 0 20px #ffd700, 0 0 40px #ffd700; }
    50%       { text-shadow: 0 0 4px #ffd700, 0 0 10px #ffd700, 0 0 20px #ffd700; }
  }

  .crt-wrapper {
    position: fixed;
    inset: 0;
    overflow-y: auto;
    animation: flicker 8s infinite;
  }

  .crt-wrapper::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.18) 2px,
      rgba(0, 0, 0, 0.18) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  .crt-wrapper::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.7) 100%);
    pointer-events: none;
    z-index: 9999;
  }
  ```

- [ ] **Step 3: Update `body` rule in `src/index.css` to add Press Start 2P**

  Find the existing `body` rule inside `@layer base` (around line 106–108):
  ```css
  body {
    @apply bg-background text-foreground;
  }
  ```
  Replace with:
  ```css
  body {
    @apply bg-background text-foreground;
    font-family: 'Press Start 2P', monospace;
    background: #000;
  }
  ```

- [ ] **Step 4: Create `src/components/ui/CRTWrapper.tsx`**

  ```tsx
  interface Props {
    children: React.ReactNode;
  }

  export function CRTWrapper({ children }: Props) {
    return <div className="crt-wrapper">{children}</div>;
  }
  ```

- [ ] **Step 5: Update `src/router.tsx` to use CRTWrapper**

  Add import at the top (after existing imports):
  ```tsx
  import { CRTWrapper } from '@/components/ui/CRTWrapper';
  ```

  Replace the root route component's return value:
  ```tsx
  // BEFORE:
  component: () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Outlet />
    </div>
  ),

  // AFTER:
  component: () => (
    <CRTWrapper>
      <Outlet />
    </CRTWrapper>
  ),
  ```

- [ ] **Step 6: Lint and type-check**

  ```bash
  pnpm lint && pnpm tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 7: Visual check**

  Open `http://localhost:3000`. You should see:
  - Scanline pattern overlaid on the whole app
  - Press Start 2P font on all text
  - Vignette darkening the screen edges
  - Occasional subtle flicker every ~8 seconds

- [ ] **Step 8: Commit**

  ```bash
  git add index.html src/index.css src/components/ui/CRTWrapper.tsx src/router.tsx
  git commit -m "feat: add CRT wrapper with scanlines, flicker, vignette and Press Start 2P font"
  ```

---

## Task 2: Home Page

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Replace `src/routes/index.tsx` with retro version**

  ```tsx
  import { Link } from '@tanstack/react-router';

  const DOTS = ['·', '·', '·', '·', '·'] as const;

  export default function HomePage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 select-none">
        {/* Score bar */}
        <div className="flex justify-between w-full max-w-xs mb-6 text-[10px]">
          <div>
            <div className="text-[#ff0000] tracking-widest mb-1">1UP</div>
            <div className="text-white tabular-nums">000000</div>
          </div>
          <div className="text-right">
            <div className="text-[#ff0000] tracking-widest mb-1">HI-SCORE</div>
            <div className="text-white tabular-nums">000000</div>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl text-[#ffd700] tracking-widest mb-4 text-center"
          style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
        >
          PAC-MAN
        </h1>

        {/* Pac-Man row */}
        <div className="flex items-center justify-center gap-1 text-base mb-6">
          <span className="text-[#ff0000]">👻</span>
          {DOTS.map((d, i) => <span key={i} className="text-[#ffd700] text-[10px]">{d}</span>)}
          <span className="text-[#ffd700] text-2xl">●</span>
          {DOTS.map((d, i) => <span key={i + 5} className="text-[#ffd700] text-[10px]">{d}</span>)}
          <span className="text-[#ffb8ff]">👻</span>
          <span className="text-[#00ffff]">👻</span>
          <span className="text-[#ffb852]">👻</span>
        </div>

        {/* Insert coin */}
        <p
          className="text-[#ffd700] text-[11px] tracking-widest mb-8 [animation:var(--animate-blink)]"
        >
          — INSERT COIN —
        </p>

        {/* Menu */}
        <nav className="flex flex-col gap-3 w-64">
          <Link
            to="/game"
            className="text-black font-bold py-3 px-6 text-center text-[11px] tracking-widest transition-all hover:brightness-110"
            style={{
              background: '#ffd700',
              boxShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)',
            }}
          >
            ▶ START GAME
          </Link>
          <Link
            to="/high-scores"
            className="py-3 px-6 text-center text-[11px] tracking-widest text-[#0080ff] border-2 border-[#0080ff] transition-all hover:brightness-125"
            style={{ boxShadow: '0 0 6px rgba(0,128,255,0.5)' }}
          >
            HIGH SCORES
          </Link>
          <Link
            to="/settings"
            className="py-3 px-6 text-center text-[11px] tracking-widest text-[#555] border-2 border-[#333] hover:border-[#555] hover:text-[#999] transition-colors"
          >
            SETTINGS
          </Link>
        </nav>

        {/* Controls hint */}
        <p className="mt-10 text-[9px] text-[#333] tracking-wider text-center leading-relaxed">
          ARROW KEYS / WASD — MOVE<br />
          P / ESC — PAUSE
        </p>

        {/* Copyright */}
        <p className="mt-4 text-[8px] text-[#222] tracking-wider">
          © 1980 NAMCO LTD. · FAN REMAKE
        </p>
      </div>
    );
  }
  ```

- [ ] **Step 2: Lint and type-check**

  ```bash
  pnpm lint && pnpm tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Visual check**

  Navigate to `http://localhost:3000`. Verify:
  - Score bar with 1UP / HI-SCORE in red labels
  - PAC-MAN title glowing and pulsing in yellow
  - "— INSERT COIN —" blinking
  - Three buttons with correct glow styles

- [ ] **Step 4: Commit**

  ```bash
  git add src/routes/index.tsx
  git commit -m "feat: retro arcade redesign — Home page"
  ```

---

## Task 3: Game HUD

**Files:**
- Modify: `src/components/game/GameHUD.tsx`

> This task requires a structural JSX change (2-column → 3-column layout). All store selectors and `togglePause` logic stay exactly the same.

- [ ] **Step 1: Replace `src/components/game/GameHUD.tsx`**

  ```tsx
  import { useGameStore } from '@/store/gameStore';
  import { useUiStore } from '@/store/uiStore';

  export function GameHUD() {
    const score = useGameStore((s) => s.score);
    const lives = useGameStore((s) => s.lives);
    const level = useGameStore((s) => s.level);
    const togglePause = useUiStore((s) => s.togglePause);
    const isPaused = useUiStore((s) => s.isPaused);

    return (
      <div className="flex items-center justify-between w-full max-w-[448px] px-2 py-2">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-[#ff0000] text-[9px] tracking-widest mb-1">1UP</span>
          <span className="text-white tabular-nums text-[11px]">
            {String(score).padStart(6, '0')}
          </span>
        </div>

        {/* Level */}
        <div className="flex flex-col items-center">
          <span className="text-[#ff0000] text-[9px] tracking-widest mb-1">LEVEL</span>
          <span className="text-white text-[11px]">{String(level).padStart(2, '0')}</span>
        </div>

        {/* Lives */}
        <span className="text-[#ffd700] text-xl tracking-[6px]">
          {'●'.repeat(Math.max(0, lives))}
        </span>

        {/* Pause button */}
        <button
          onClick={togglePause}
          className="text-[9px] text-[#555] border border-[#333] px-2 py-1 hover:text-white hover:border-[#555] transition-colors"
        >
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      </div>
    );
  }
  ```

- [ ] **Step 2: Lint and type-check**

  ```bash
  pnpm lint && pnpm tsc --noEmit
  ```

- [ ] **Step 3: Visual check**

  Go to `http://localhost:3000/game`. Verify the HUD shows 1UP/LEVEL columns, life dots in yellow, and a retro pause button.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/game/GameHUD.tsx
  git commit -m "feat: retro arcade redesign — Game HUD (3-column layout)"
  ```

---

## Task 4: Pause Menu

**Files:**
- Modify: `src/components/game/PauseMenu.tsx`

- [ ] **Step 1: Replace `src/components/game/PauseMenu.tsx`**

  ```tsx
  import { Link } from '@tanstack/react-router';
  import { useUiStore } from '@/store/uiStore';

  export function PauseMenu() {
    const setPaused = useUiStore((s) => s.setPaused);

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-6">
        <h2
          className="text-3xl text-[#ffd700] tracking-widest"
          style={{ animation: 'glow-pulse 1.5s ease-in-out infinite' }}
        >
          PAUSED
        </h2>

        <div className="flex flex-col gap-3 w-44">
          <button
            onClick={() => setPaused(false)}
            className="text-black font-bold py-2 px-6 text-[11px] tracking-widest transition-all hover:brightness-110"
            style={{
              background: '#ffd700',
              boxShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)',
            }}
          >
            ▶ RESUME
          </button>
          <Link
            to="/"
            className="border border-[#333] text-[#555] hover:border-[#555] hover:text-white py-2 px-6 text-center text-[11px] tracking-widest transition-colors"
          >
            MAIN MENU
          </Link>
        </div>

        <div className="text-[9px] text-center leading-loose mt-2">
          <p className="text-[#555] tracking-widest mb-2">— CONTROLS —</p>
          <p className="text-[#333]">↑ ↓ ← →  /  W A S D — MOVE</p>
          <p className="text-[#333]">P  /  ESC — PAUSE</p>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Lint and type-check**

  ```bash
  pnpm lint && pnpm tsc --noEmit
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/game/PauseMenu.tsx
  git commit -m "feat: retro arcade redesign — Pause menu"
  ```

---

## Task 5: Game Over / Victory Overlay

**Files:**
- Modify: `src/routes/game.tsx` — only the `GameOverOverlay` component's returned JSX

> `GameOverOverlay` is a non-exported component at the top of `game.tsx`. All hooks (`useSaveHighScore`, `useState`) and form logic remain unchanged. Only the returned JSX changes.

- [ ] **Step 1: Replace the `return (...)` block of `GameOverOverlay` in `src/routes/game.tsx`**

  Replace only the JSX return value (lines 36–85). Keep the function signature, state, and `handleSubmit` exactly as-is:

  ```tsx
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4">
      <h2
        className="text-2xl tracking-widest"
        style={
          status.type === 'victory'
            ? { color: '#ffd700', animation: 'glow-pulse 1.5s infinite', textShadow: '0 0 8px #ffd700, 0 0 20px #ffd700' }
            : { color: '#ff0000', textShadow: '0 0 8px #ff0000, 0 0 20px #ff0000' }
        }
      >
        {status.type === 'victory' ? 'YOU WIN!' : 'GAME OVER'}
      </h2>

      <p
        className="text-[#ffd700] text-xl tabular-nums"
        style={{ textShadow: '0 0 8px #ffd700' }}
      >
        {String(score).padStart(6, '0')}
      </p>

      {!isSaved ? (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-48">
          <p className="text-[10px] text-[#ffd700] [animation:var(--animate-blink)]">
            ENTER YOUR INITIALS
          </p>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={10}
            placeholder="YOUR NAME"
            disabled={isSaving}
            className="w-full bg-black border-2 border-[#333] focus:border-[#ffd700] text-white text-center py-2 px-3 uppercase tracking-widest text-[10px] placeholder:text-[#333] placeholder:normal-case outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isSaving || !playerName.trim()}
            className="w-full text-black font-bold py-2 text-[10px] tracking-widest disabled:opacity-40 transition-all hover:brightness-110"
            style={{
              background: '#ffd700',
              boxShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)',
            }}
          >
            {isSaving ? 'SAVING...' : 'SAVE SCORE'}
          </button>
        </form>
      ) : (
        <p className="text-green-400 text-[10px] tracking-wider">✓ SCORE SAVED</p>
      )}

      <div className="flex gap-3 mt-1">
        {isSaved && (
          <Link
            to="/high-scores"
            className="text-white text-[10px] py-2 px-4 tracking-wider transition-all hover:brightness-125"
            style={{
              background: '#0066cc',
              boxShadow: '0 0 6px rgba(0,128,255,0.5)',
            }}
          >
            LEADERBOARD
          </Link>
        )}
        <Link
          to="/"
          className="border border-[#333] text-[#555] hover:border-[#555] hover:text-white py-2 px-4 text-[10px] tracking-wider transition-colors"
        >
          ← MAIN MENU
        </Link>
      </div>
    </div>
  );
  ```

- [ ] **Step 2: Lint and type-check**

  ```bash
  pnpm lint && pnpm tsc --noEmit
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/routes/game.tsx
  git commit -m "feat: retro arcade redesign — Game Over / Victory overlay"
  ```

---

## Task 6: High Scores Page + Table

**Files:**
- Modify: `src/routes/high-scores.tsx`
- Modify: `src/components/leaderboard/HighScoresTable.tsx`

- [ ] **Step 1: Replace `src/routes/high-scores.tsx`**

  ```tsx
  import { Link } from "@tanstack/react-router";
  import { useHighScores } from "@/hooks/useHighScores";
  import { HighScoresTable } from "@/components/leaderboard/HighScoresTable";

  export default function HighScoresPage() {
    const { data: scores, isLoading, isError } = useHighScores();

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <Link
              to="/"
              className="text-[#555] hover:text-white transition-colors text-[10px] tracking-wider"
            >
              ← BACK
            </Link>
            <h1
              className="text-xl text-[#ffd700] tracking-widest"
              style={{ textShadow: '0 0 8px #ffd700, 0 0 20px #ffd700' }}
            >
              HIGH SCORES
            </h1>
          </div>

          {isLoading && (
            <div className="text-center py-10 text-[#ffd700] text-[10px] tracking-widest [animation:var(--animate-blink)]">
              LOADING...
            </div>
          )}

          {isError && (
            <div className="text-center py-10 text-[#ff0000] text-[10px]">
              FAILED TO LOAD SCORES.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {scores && scores.length > 0 ? (
                <HighScoresTable scores={scores} />
              ) : (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">🏆</p>
                  <p className="text-[#333] text-[10px] mb-1">NO SCORES RECORDED YET.</p>
                  <p className="text-[#222] text-[9px]">COMPLETE A GAME TO APPEAR HERE.</p>
                </div>
              )}
            </>
          )}

          <div className="border-t border-[#111] mt-6 pt-6 text-center">
            <Link
              to="/game"
              className="text-black font-bold py-2 px-6 text-[10px] tracking-widest transition-all hover:brightness-110 inline-block"
              style={{
                background: '#ffd700',
                boxShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)',
              }}
            >
              ▶ PLAY NOW
            </Link>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Replace `src/components/leaderboard/HighScoresTable.tsx`**

  ```tsx
  import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table';
  import type { HighScore } from '@/types/game.types';

  const columnHelper = createColumnHelper<HighScore>();

  const RANK_COLORS = ['text-[#ffd700]', 'text-[#c0c0c0]', 'text-[#cd7f32]'] as const;

  const columns = [
    columnHelper.display({
      id: 'rank',
      header: '#',
      cell: ({ row }) => (
        <span className={RANK_COLORS[row.index] ?? 'text-[#333]'}>
          {row.index + 1}
        </span>
      ),
    }),
    columnHelper.accessor('playerName', {
      header: 'PLAYER',
      cell: (info) => (
        <span className="text-white tracking-wider">{info.getValue().toUpperCase()}</span>
      ),
    }),
    columnHelper.accessor('score', {
      header: 'SCORE',
      cell: (info) => (
        <span className="text-[#ffd700] tabular-nums">
          {String(info.getValue()).padStart(6, '0')}
        </span>
      ),
    }),
    columnHelper.accessor('level', {
      header: 'LV',
      cell: (info) => <span className="text-[#555]">{info.getValue()}</span>,
    }),
    columnHelper.accessor('timestamp', {
      header: 'DATE',
      cell: (info) => (
        <span className="text-[#222] text-[9px]">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
  ];

  interface Props {
    scores: HighScore[];
  }

  export function HighScoresTable({ scores }: Props) {
    const table = useReactTable({
      data: scores,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <table className="w-full text-[10px]">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-[#1a1a1a]">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="py-2 px-1 text-left text-[#ff0000] tracking-widest font-bold"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-[#111] hover:bg-[#0a0a0a] transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-2 px-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  ```

- [ ] **Step 3: Lint and type-check**

  ```bash
  pnpm lint && pnpm tsc --noEmit
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/routes/high-scores.tsx src/components/leaderboard/HighScoresTable.tsx
  git commit -m "feat: retro arcade redesign — High Scores page and table"
  ```

---

## Task 7: Settings Page

**Files:**
- Modify: `src/routes/settings.tsx`

- [ ] **Step 1: Replace `src/routes/settings.tsx`**

  ```tsx
  import { Link } from '@tanstack/react-router';
  import { useSettingsStore } from '@/store/settingsStore';

  const DIFFICULTIES = ['easy', 'normal', 'hard'] as const;

  export default function SettingsPage() {
    const { soundEnabled, difficulty, toggleSound, setDifficulty } = useSettingsStore();

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
        <div className="w-full max-w-xs">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <Link to="/" className="text-[#555] hover:text-white transition-colors text-[10px] tracking-wider">
              ← BACK
            </Link>
            <h1
              className="text-xl text-[#ffd700] tracking-widest"
              style={{ textShadow: '0 0 8px #ffd700, 0 0 20px #ffd700' }}
            >
              SETTINGS
            </h1>
          </div>

          {/* Sound toggle */}
          <section className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white text-[11px] tracking-wider">SOUND</span>
              <button
                onClick={toggleSound}
                aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
                className="relative w-12 h-6 transition-colors focus-visible:outline-none"
                style={{
                  backgroundColor: soundEnabled ? '#ffd700' : '#1a1a1a',
                  boxShadow: soundEnabled ? '0 0 8px rgba(255,215,0,0.4)' : 'none',
                }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-black transition-all"
                  style={{ left: soundEnabled ? '1.375rem' : '0.125rem' }}
                />
              </button>
            </div>
            <p className="text-[9px] text-[#333] mt-1 tracking-wider">
              {soundEnabled ? 'ON' : 'OFF'}
            </p>
          </section>

          <div className="border-t border-[#111] mb-6" />

          {/* Difficulty */}
          <section className="mb-6">
            <p className="text-white text-[11px] tracking-wider mb-3">DIFFICULTY</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => {
                const isActive = difficulty === d;
                const btnClass = isActive
                  ? 'flex-1 py-2 text-[9px] uppercase tracking-wider transition-all border'
                  : 'flex-1 py-2 text-[9px] uppercase tracking-wider transition-all border border-[#333] text-[#555] hover:border-[#555] hover:text-white';
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={btnClass}
                    style={
                      isActive
                        ? {
                            background: '#ffd700',
                            borderColor: '#ffd700',
                            color: '#000',
                            boxShadow: '0 0 6px rgba(255,215,0,0.4)',
                          }
                        : undefined
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="border-t border-[#111] mb-6" />

          {/* Controls reference */}
          <section>
            <p className="text-white text-[11px] tracking-wider mb-3">CONTROLS</p>
            <div className="space-y-2 text-[9px]">
              <div className="flex justify-between border-b border-[#0d0d0d] pb-2">
                <span className="text-[#555]">MOVE</span>
                <span className="text-[#333]">↑ ↓ ← →  /  W A S D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555]">PAUSE</span>
                <span className="text-[#333]">P  /  ESC</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
  ```

  > **Note on difficulty buttons:** The `{...spread}` pattern may cause a TS error for duplicate `className`. Simplify by computing `className` conditionally in a variable instead:
  > ```tsx
  > const btnClass = difficulty === d
  >   ? 'flex-1 py-2 text-[9px] uppercase tracking-wider transition-all border'
  >   : 'flex-1 py-2 text-[9px] uppercase tracking-wider transition-all border border-[#333] text-[#555] hover:border-[#555] hover:text-white';
  > ```
  > Then use `className={btnClass}` on the button element.

- [ ] **Step 2: Lint and type-check**

  ```bash
  pnpm lint && pnpm tsc --noEmit
  ```

- [ ] **Step 3: Visual check**

  Navigate to `http://localhost:3000/settings`. Verify:
  - Yellow glow on SETTINGS title
  - Sound toggle glows yellow when ON
  - Active difficulty button fills yellow with glow

- [ ] **Step 4: Commit**

  ```bash
  git add src/routes/settings.tsx
  git commit -m "feat: retro arcade redesign — Settings page"
  ```

---

## Task 8: Final Review

- [ ] **Step 1: Full lint and type-check**

  ```bash
  pnpm lint && pnpm tsc --noEmit
  ```
  Expected: zero errors.

- [ ] **Step 2: Visual review — all screens**

  Check each route:
  - `/` — Home: score bar, glowing title, INSERT COIN blink, menu buttons with glow
  - `/game` — HUD 3-column, canvas, pause overlay with glow-pulse
  - `/game` (game over) — red GAME OVER glow, score, input, save flow
  - `/high-scores` — yellow title, colored rank cells, PLAY NOW button
  - `/settings` — yellow title, toggle glow, difficulty buttons

  Across all screens verify:
  - Scanlines visible over content
  - Press Start 2P font applied everywhere
  - Vignette visible at screen edges
  - Occasional flicker (wait ~8 seconds)

- [ ] **Step 3: Add `.superpowers/` to `.gitignore` if not already present**

  ```bash
  grep -q '.superpowers' .gitignore || echo '.superpowers/' >> .gitignore
  git add .gitignore
  git commit -m "chore: ignore .superpowers brainstorm files"
  ```
