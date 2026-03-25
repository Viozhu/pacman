# UI Redesign — Retro Arcade CRT Design Spec

**Date:** 2026-03-25
**Status:** Approved

---

## Overview

Full visual redesign of the Pac-Man web game UI using a **Retro Arcade / Full CRT** aesthetic. All six screens are updated to look and feel like a real 1980s arcade cabinet with modern web techniques.

---

## Design Direction

**Style:** Retro Arcade
**Effects:** Full CRT — scanlines overlay, occasional screen flicker, phosphor glow, edge vignette
**Font:** `Press Start 2P` (Google Fonts) — applied globally via `body` in `@layer base`
**Color palette:**
- Background: `#000000`
- Primary accent: `#FFD700` (yellow, phosphor glow)
- Danger / labels: `#FF0000` (red — 1UP labels, GAME OVER)
- Blue action: `#0080FF` (HIGH SCORES button border)
- Ghost colors: red `#FF0000`, pink `#FFB8FF`, cyan `#00FFFF`, orange `#FFB852`
- Muted text: `#555555`, `#333333`, `#222222`

---

## Global CRT Layer

### `index.html` — Google Fonts

Add these two `<link>` tags inside `<head>` before any stylesheets. Do NOT use a CSS `@import` (redundant and slower):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
```

### `src/index.css` — New keyframes and classes

The existing `blink` keyframe defined inside `@theme inline` is correct and must not be redefined. The existing `--animate-blink` token (`blink 1s step-start infinite`) can be used directly via `[animation:var(--animate-blink)]` in Tailwind v4 class strings.

Add the following **after** the existing `@layer base` blocks (not inside them):

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

> **Flicker timing**: `8s` cycle so the opacity dip (at 90–94%) fires once every ~8 seconds — realistic CRT behavior without being visually aggressive.

Also update the existing `@layer base` body rule to add the font:

```css
/* Replace the existing body rule inside @layer base */
body {
  @apply bg-background text-foreground;
  font-family: 'Press Start 2P', monospace;
  background: #000;
}
```

### `src/components/ui/CRTWrapper.tsx` — New file

```tsx
interface Props { children: React.ReactNode; }

export function CRTWrapper({ children }: Props) {
  return <div className="crt-wrapper">{children}</div>;
}
```

### `src/router.tsx` — Apply CRTWrapper

Replace the root route's existing `<div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">` wrapper:

```tsx
import { CRTWrapper } from '@/components/ui/CRTWrapper';

const rootRoute = createRootRoute({
  component: () => (
    <CRTWrapper>
      <Outlet />
    </CRTWrapper>
  ),
});
```

`App.tsx` is **not used** by this app — bootstrapped via `main.tsx` → `RouterProvider` directly. Do not touch it.

### Glow Text-Shadow Reference Values

- **Yellow glow** (titles, scores): `0 0 8px #ffd700, 0 0 20px #ffd700, 0 0 40px #ffd700`
- **Red glow** (GAME OVER): `0 0 8px #ff0000, 0 0 20px #ff0000`
- **Blue glow** (button box-shadow): `0 0 6px rgba(0,128,255,0.5)`
- **Yellow button glow** (box-shadow): `0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)`

---

## Screens

### 1. Home Page (`src/routes/index.tsx`)

Full visual update. Keep existing `Link` structure and routing — only change markup and classes.

- **Score bar** (decorative, hardcoded `000000`): flex row, `1UP` label red, `HI-SCORE` label red, values white
- **Title** `PAC-MAN` — `text-[#ffd700]`, `style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}`
- **Pac-Man row** — keep current ghost emojis + dots structure, no change
- **"— INSERT COIN —"** — `text-[#ffd700]`, `className="[animation:var(--animate-blink)]"`
- **Menu buttons (260px wide column):**
  - `▶ START GAME` — `bg-[#ffd700] text-black font-bold py-3 px-6`, `style={{ boxShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)' }}`
  - `HIGH SCORES` — `border-2 border-[#0080ff] text-[#0080ff]`, `style={{ boxShadow: '0 0 6px rgba(0,128,255,0.5)' }}`
  - `SETTINGS` — `border-2 border-[#333] text-[#555] hover:border-[#555] hover:text-[#999]`
- **Controls hint** — `text-[#333]`, two lines
- **Copyright** — `text-[#222]`, 6px: `© 1980 NAMCO LTD. · FAN REMAKE`

### 2. Game HUD (`src/components/game/GameHUD.tsx`)

**Structural JSX change** — new three-column layout (was two-area). Keep all store selectors and `togglePause` logic.

New layout: `flex items-center justify-between w-full max-w-[448px] px-2 py-2`

- Left block (`flex flex-col`): `1UP` label (`text-[#ff0000] text-[10px] tracking-widest`) above score (`text-white tabular-nums`)
- Center block (`flex flex-col items-center`): `LEVEL` label (`text-[#ff0000] text-[10px]`) above level number (`text-white`)
- Right block: `●●●` lives dots — `text-[#ffd700] text-xl tracking-[6px]`
- Far right: pause/resume button — `text-[#555] border border-[#333] px-2 py-1 text-[10px] hover:text-white hover:border-[#555] transition-colors`

### 3. Pause Menu (`src/components/game/PauseMenu.tsx`)

Edit JSX styles only — no structural changes.

- `PAUSED` — `text-[#ffd700]`, `style={{ animation: 'glow-pulse 1.5s ease-in-out infinite' }}`
- `▶ RESUME` — `bg-[#ffd700] text-black font-bold py-2 px-6`, yellow box-shadow glow
- `MAIN MENU` — `border border-[#333] text-[#555] hover:border-[#555] hover:text-white py-2 px-6`
- `— CONTROLS —` label — `text-[#555]`; key/value text — `text-[#333]`

### 4. Game Over / Victory Overlay (`src/routes/game.tsx`)

`GameOverOverlay` is already a non-exported component defined at the top of `game.tsx`. Edit its returned JSX only — keep all state, form logic, and `useSaveHighScore` hook unchanged.

- **GAME OVER title**: `text-[#ff0000]`, `style={{ textShadow: '0 0 8px #ff0000, 0 0 20px #ff0000' }}`
- **YOU WIN! title**: `text-[#ffd700]`, `style={{ animation: 'glow-pulse 1.5s infinite', textShadow: '0 0 8px #ffd700, 0 0 20px #ffd700' }}`
- Score: `text-[#ffd700] tabular-nums`, `style={{ textShadow: '0 0 8px #ffd700' }}`
- Name input: `bg-black border-2 border-[#333] focus:border-[#ffd700] text-white text-center uppercase tracking-widest outline-none transition-colors py-2 px-3 w-48`
- `SAVE SCORE` button: `bg-[#ffd700] text-black font-bold py-2 px-4 disabled:opacity-40`, yellow box-shadow glow
- `← MAIN MENU` link: `border border-[#333] text-[#555] hover:text-white py-2 px-4`
- Blinking hint: `text-[#ffd700] text-[10px] [animation:var(--animate-blink)]`
- `✓ SCORE SAVED` confirmation: `text-green-400 text-[10px]`

### 5. High Scores Page (`src/routes/high-scores.tsx` + `HighScoresTable`)

**`high-scores.tsx`:**
- Header: `← BACK` (`text-[#555] hover:text-white text-[10px]`) + `HIGH SCORES` (`text-[#ffd700]`, `style={{ textShadow: '0 0 8px #ffd700, 0 0 20px #ffd700' }}`)
- Loading: `text-[#ffd700] [animation:var(--animate-blink)]`
- Error: `text-[#ff0000]`
- Empty state: keep structure, restyle text to `text-[#333]`
- Footer `▶ PLAY NOW`: `bg-[#ffd700] text-black font-bold py-2 px-6`, yellow box-shadow glow

**`HighScoresTable.tsx`:**
- `<table>`: `w-full text-[10px]`
- Header `<th>`: `text-[#ff0000] tracking-widest`
- Rank colors array: `['text-[#ffd700]', 'text-[#c0c0c0]', 'text-[#cd7f32]']`, fallback `text-[#333]`
- Player name: `text-white tracking-wider`
- Score: `text-[#ffd700] tabular-nums`
- Level: `text-[#555]`
- Date: `text-[#222] text-[9px]`
- Row hover: `hover:bg-[#0a0a0a]`

### 6. Settings Page (`src/routes/settings.tsx`)

Edit JSX styles only — keep all store selectors and handlers.

- Header: `← BACK` + `SETTINGS` (`text-[#ffd700]`, yellow glow text-shadow)
- **Sound toggle**: keep existing `<button>` + `<span>` implementation. Add `boxShadow: soundEnabled ? '0 0 8px rgba(255,215,0,0.4)' : 'none'` to the button's inline style
- **Difficulty buttons**: active → `bg-[#ffd700] border-[#ffd700] text-black`, add `style={{ boxShadow: '0 0 6px rgba(255,215,0,0.4)' }}` to active button; inactive → `border-[#333] text-[#555] hover:border-[#555] hover:text-white`
- Section dividers: `border-[#111]`
- Controls labels: `text-[#555]`; values: `text-[#333]`

---

## Files to Modify

| File | Change |
|---|---|
| `index.html` | Add 3 Google Fonts `<link>` tags in `<head>` |
| `src/index.css` | Add `flicker`, `glow-pulse` keyframes + `.crt-wrapper` class; update `body` rule in `@layer base` to add font-family |
| `src/router.tsx` | Import `CRTWrapper`, replace root route's `<div>` with `<CRTWrapper>` |
| `src/components/ui/CRTWrapper.tsx` | **New file** — renders `<div className="crt-wrapper">{children}</div>` |
| `src/routes/index.tsx` | Full visual update |
| `src/routes/game.tsx` | Edit `GameOverOverlay` JSX only |
| `src/routes/high-scores.tsx` | Update layout + states |
| `src/routes/settings.tsx` | Update styles only |
| `src/components/game/GameHUD.tsx` | Structural JSX refactor to 3-column layout + new styles |
| `src/components/game/PauseMenu.tsx` | Update styles only |
| `src/components/leaderboard/HighScoresTable.tsx` | Update cell styles and rank colors |
