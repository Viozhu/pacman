# Sound System Design

**Date:** 2026-03-25
**Status:** Approved

## Overview

Add a complete arcade sound system to the Pac-Man game using Web Audio API synthesis (no external audio files). All sounds are generated in real time through a `SoundManager` singleton that follows the existing pattern of `renderer` and `inputManager`.

## Requirements

- 8 distinct game sounds: chomp, power pellet, eat ghost, death, intro, level complete, victory, game over
- Siren loops continuously during gameplay and speeds up as fewer dots remain
- Volume is adjustable (0–1) and persisted to `localStorage`
- Settings page shows a slider instead of an on/off toggle; clicking the speaker icon mutes/unmutes quickly, restoring the previous volume
- Volume change takes effect even when the game is not running

## Architecture

### New file: `src/engine/core/SoundManager.ts`

A singleton class (exported as `soundManager`) that:

- Creates and owns one `AudioContext` (lazily created on `init()`)
- Maintains a master `GainNode` for global volume control
- Exposes `play(sound: SoundEvent)` for one-shot sounds
- Exposes `startSiren()` / `stopSiren()` for the looping background siren
- Exposes `updateSirenSpeed(dotsRemaining: number, totalDots: number)` to ramp siren frequency
- Exposes `setVolume(v: number)` (0–1) — safe to call at any time, including before `init()`
- Exposes `init()` to (re-)create the `AudioContext` after a user gesture (required by browsers)

```typescript
type SoundEvent = 'chomp' | 'pellet' | 'eatGhost' | 'death' | 'intro' | 'levelComplete' | 'victory' | 'gameOver'
```

The siren is intentionally excluded from `SoundEvent` because it is a continuous loop managed via `startSiren()`/`stopSiren()`, not a one-shot event. Passing `'siren'` to `play()` is a compile-time error by design.

All synthesis uses oscillators and `GainNode` envelopes — no `AudioBuffer` loading.

### `play()` guard

If `play()` is called before `init()` (i.e., `AudioContext` is `null`), the call is silently dropped. No error is thrown.

### Sound synthesis

| Sound | Technique | Duration | Trigger |
|-------|-----------|----------|---------|
| chomp | Alternating tones ~180Hz / ~220Hz, short envelope. Toggle state (which pitch is next) lives as a private field in `SoundManager`. Overlapping calls are allowed — each dot fires a new oscillator without cancelling the previous one. | ~80ms | `result.ateDot` in `Game.update()` |
| pellet | Descending tone with vibrato | ~500ms | `result.atePellet` in `Game.update()` |
| eatGhost | Short ascending tone | ~200ms | `result.ateGhost !== null` in `Game.update()` |
| death | Descending chromatic sequence | ~1500ms | `result.hitGhost` with lives remaining, in `Game.update()` |
| intro | 4-note arcade melody | ~4000ms | Called once in `useGameEngine.ts` after `soundManager.init()`, before the game loop starts |
| levelComplete | Short ascending jingle | ~1000ms | `remaining === 0` and `level < MAX_LEVELS` in `Game.update()` |
| victory | Longer triumphant jingle | ~2000ms | `remaining === 0` and `level >= MAX_LEVELS` in `Game.update()` |
| gameOver | Slow descending melody | ~2000ms | `result.hitGhost` with no lives remaining (status becomes `'game-over'`), in `Game.update()` |
| siren | Sine oscillator loop, frequency interpolates from ~200Hz (full board) to ~600Hz (empty board) | continuous | `startSiren()` / `stopSiren()` |

### Siren oscillator lifecycle

`OscillatorNode` instances can only be started once — stopping them permanently. Therefore:

- `startSiren()` always creates a **new** `OscillatorNode` connected to the master gain, then calls `start()`.
- `stopSiren()` calls `oscillator.stop()` and sets the internal reference to `null`.
- Calling `startSiren()` a second time (e.g., after dying and respawning) works correctly because a new oscillator is created.

### AudioContext visibility handling

When the browser tab is hidden, the `AudioContext` may be auto-suspended. `SoundManager.init()` attaches a `document.visibilitychange` listener that calls `audioContext.resume()` when the tab becomes visible again. This ensures the siren resumes correctly on tab focus.

### Modified files

**`src/store/settingsStore.ts`**
- Replace `soundEnabled: boolean` with `volume: number` (default `0.7`)
- Add `lastVolume: number` (default `0.7`) — stores the pre-mute volume so the speaker icon can restore it
- Replace `toggleSound()` with `setVolume(v: number)` and `mute()` / `unmute()` helpers
- Add Zustand `persist` middleware with `version: 1` and a `migrate` function:
  - v0 → v1: if `soundEnabled === false`, set `volume: 0`; otherwise set `volume: 0.7`; remove `soundEnabled`
- `localStorage` key: `pac-man-settings`

**`src/engine/core/Game.ts`**
- Import `soundManager`
- Call `soundManager.play('chomp')` when `result.ateDot`
- Call `soundManager.play('pellet')` when `result.atePellet`
- Call `soundManager.play('eatGhost')` when `result.ateGhost !== null`
- When `result.hitGhost`:
  - If game-over: `soundManager.play('gameOver')`
  - If lives remain: `soundManager.play('death')`
- When `remaining === 0`:
  - If `level < MAX_LEVELS`: `soundManager.play('levelComplete')`
  - If `level >= MAX_LEVELS`: `soundManager.play('victory')`
- Call `soundManager.updateSirenSpeed(remaining, totalDots)` every frame

**`src/hooks/useGameEngine.ts`**
- Call `soundManager.init()` before creating the `Game` instance
- Call `soundManager.play('intro')` immediately after `init()`
- Call `soundManager.startSiren()` after the game loop starts
- Call `soundManager.stopSiren()` in cleanup
- Subscribe to `volume` from settings store and call `soundManager.setVolume(v)` on change

**`src/routes/settings.tsx`**
- Replace the boolean toggle with `<input type="range" min="0" max="1" step="0.01">` bound to `volume`
- Add a speaker icon button: if `volume > 0`, clicking calls `mute()` (sets `volume: 0`, saves current as `lastVolume`); if `volume === 0`, clicking calls `unmute()` (restores `lastVolume`)
- Volume changes call `soundManager.setVolume(v)` directly (not via `useGameEngine`) so they take effect on the Settings page even when the game is not running

## Data flow

```
settingsStore.volume
    → soundManager.setVolume()   (via useGameEngine subscription when game is running)
    → soundManager.setVolume()   (directly from settings.tsx when game is not running)
    → master GainNode.gain.value

Game.update()
    → result.ateDot         → soundManager.play('chomp')
    → result.atePellet      → soundManager.play('pellet')
    → result.ateGhost       → soundManager.play('eatGhost')
    → result.hitGhost       → soundManager.play('death') | play('gameOver')
    → remaining === 0       → soundManager.play('levelComplete') | play('victory')
    → every frame           → soundManager.updateSirenSpeed(remaining, total)

useGameEngine (mount)
    → soundManager.init()
    → soundManager.play('intro')
    → soundManager.startSiren()

useGameEngine (unmount)
    → soundManager.stopSiren()
```

## Constraints

- `AudioContext` requires a user gesture — `init()` is called inside a `useEffect`, which fires only after the user navigates to the game page (a user gesture has already occurred)
- `play()` silently no-ops if called before `init()`
- `SoundManager` is a singleton to match the pattern of `renderer` and `inputManager`
- No external packages or audio files are introduced
- `setVolume()` stores the value internally and applies it to the `GainNode` immediately if the context exists; if not yet initialized, it is applied on `init()`

## Out of scope

- Different sound themes / sound packs
- Per-sound volume control
- Sound for menu navigation clicks
