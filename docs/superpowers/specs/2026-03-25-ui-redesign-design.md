# UI Redesign — Retro Arcade CRT Design Spec

**Date:** 2026-03-25
**Status:** Approved

---

## Overview

Full visual redesign of the Pac-Man web game UI using a **Retro Arcade / Full CRT** aesthetic. All six screens are updated to look and feel like a real 1980s arcade cabinet with modern web techniques.

---

## Design Direction

**Style:** Retro Arcade
**Effects:** Full CRT — scanlines overlay, screen flicker animation, phosphor glow, edge vignette
**Font:** `Press Start 2P` (Google Fonts) — replaces `font-mono` system font across all UI
**Color palette:**
- Background: `#000000`
- Primary accent: `#FFD700` (yellow, phosphor glow)
- Danger / labels: `#FF0000` (red — 1UP labels, GAME OVER)
- Blue action: `#0080FF` (HIGH SCORES button border)
- Ghost colors: red `#FF0000`, pink `#FFB8FF`, cyan `#00FFFF`, orange `#FFB852`
- Muted text: `#555555`, `#333333`, `#222222`

---

## Global CRT Layer

A single `CRTWrapper` component wraps the entire app (inside `App.tsx` or the router outlet). It applies:

1. **Scanlines** — `::after` pseudo-element with `repeating-linear-gradient` at 4px pitch, 18% opacity
2. **Flicker** — CSS `@keyframes flicker` on opacity (92–96% range, 0.15s cycle) on the wrapper
3. **Vignette** — `::before` radial gradient, transparent center → 70% black at edges
4. **Font injection** — Google Fonts `Press Start 2P` loaded in `index.html`

The CRT layer is `pointer-events: none` and `z-index: 100+` so it never blocks interaction.

---

## Screens

### 1. Home Page (`src/routes/index.tsx`)

**Layout:** Centered column, full-screen black.

- **Score bar** at top: `1UP` (red label) + score left, `HI-SCORE` right — 8px font
- **Title** `PAC-MAN` — 36px, yellow with `glow-pulse` animation (oscillating text-shadow)
- **Pac-Man row** — ghost emojis + dots + power pellet, same as current but styled with retro colors
- **"— INSERT COIN —"** — 9px, yellow, CSS `blink` animation (1s step-start)
- **Menu buttons:**
  - `▶ START GAME` — filled yellow, black text, yellow glow shadow
  - `HIGH SCORES` — transparent, blue border + blue text, blue glow
  - `SETTINGS` — transparent, dark gray border + muted text
- **Controls hint** — 7px, `#333`, two lines
- **Copyright line** — 6px, `#222`

### 2. Game HUD (`src/components/game/GameHUD.tsx`)

**Layout:** Horizontal bar above canvas, max-width 448px.

- Left: `1UP` label (red, 6px) + score value (white, 8px tabular)
- Center: `LEVEL` label (red, 6px) + level number (white)
- Right: lives as `●●●` dots (yellow, 12px, letter-spacing)
- Far right: `⏸ PAUSE` button — small, gray, bordered, retro style

### 3. Pause Menu (`src/components/game/PauseMenu.tsx`)

**Layout:** Absolute overlay, `bg-black/90`, centered column.

- `PAUSED` — 22px, yellow, `glow-pulse` animation
- `▶ RESUME` — filled yellow button
- `MAIN MENU` — ghost button (transparent, dark border)
- Controls reference — 6px, `#333`, `— CONTROLS —` label in `#555`

### 4. Game Over / Victory Overlay (`src/routes/game.tsx` → `GameOverOverlay`)

**Layout:** Absolute overlay, `bg-black/90`, centered column.

- **Game Over**: `GAME OVER` — 18px, red, red glow shadow
- **Victory**: `YOU WIN!` — 18px, yellow, yellow glow + `glow-pulse`
- Score — 14px yellow with glow
- Name input — black bg, `#333` border → `#FFD700` on focus, Press Start 2P, uppercase, centered
- `SAVE SCORE` — yellow filled button
- `← MAIN MENU` — ghost button
- After save: `LEADERBOARD` blue button + `MENU` ghost button
- Blinking hint `ENTER YOUR INITIALS` — 6px yellow, blink animation

### 5. High Scores Page (`src/routes/high-scores.tsx` + `HighScoresTable`)

**Layout:** Centered column, max-width `sm`.

- Header: `← BACK` (gray) + `HIGH SCORES` title (yellow glow, 12px)
- Table columns: `#` · `PLAYER` · `SCORE` · `LV` · `DATE`
- Rank colors: #1 gold `#FFD700`, #2 silver `#C0C0C0`, #3 bronze `#CD7F32`, rest `#333`
- Score column: yellow tabular nums
- Loading state: `LOADING...` blink animation
- Footer: `▶ PLAY NOW` yellow filled button

### 6. Settings Page (`src/routes/settings.tsx`)

**Layout:** Centered column, max-width `xs`.

- Header: `← BACK` + `SETTINGS` (yellow glow)
- **Sound row**: label + toggle switch (yellow when ON, glow shadow)
- Horizontal rule: `border-gray-900`
- **Difficulty row**: label above + three buttons (`EASY` / `NORMAL` / `HARD`), active = yellow filled with glow
- **Controls section**: two rows (MOVE / PAUSE), muted key + value

---

## Implementation Notes

- Add `Press Start 2P` to `index.html` via Google Fonts `<link>`
- Create `src/components/ui/CRTWrapper.tsx` — single wrapper with scanlines/flicker/vignette CSS
- Apply `CRTWrapper` once in `App.tsx` (or root layout)
- All `font-mono` references replaced with the new font (handled via CSS since Press Start 2P is loaded globally as a web font)
- CSS animations defined in `src/index.css`: `flicker`, `glow-pulse`, `blink`
- Use `text-shadow` utilities or inline styles for glow effects (Tailwind v4 supports arbitrary values)
- Keep all existing logic, store, hooks, and routing unchanged — only visual layer changes

---

## Files to Modify

| File | Change |
|---|---|
| `index.html` | Add Google Fonts link for Press Start 2P |
| `src/index.css` | Add global CRT keyframes + font-family override |
| `src/App.tsx` | Wrap outlet with `CRTWrapper` |
| `src/components/ui/CRTWrapper.tsx` | New component |
| `src/routes/index.tsx` | Full visual update |
| `src/routes/game.tsx` | Update `GameOverOverlay` |
| `src/routes/high-scores.tsx` | Update layout + states |
| `src/routes/settings.tsx` | Update all controls |
| `src/components/game/GameHUD.tsx` | Update HUD bar |
| `src/components/game/PauseMenu.tsx` | Update overlay |
| `src/components/leaderboard/HighScoresTable.tsx` | Update table styles |
