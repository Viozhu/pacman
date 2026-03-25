# Sound System Design

**Date:** 2026-03-25
**Status:** Approved

## Overview

Add a complete arcade sound system to the Pac-Man game using Web Audio API synthesis (no external audio files). All sounds are generated in real time through a `SoundManager` singleton that follows the existing pattern of `renderer` and `inputManager`.

## Requirements

- 8 distinct game sounds: chomp, power pellet, eat ghost, death, intro, level complete, game over, siren
- Siren loops continuously during gameplay and speeds up as fewer dots remain
- Volume is adjustable (0–1) and persisted to `localStorage`
- Settings page shows a slider instead of an on/off toggle; clicking the speaker icon mutes/unmutes quickly
- Respects the existing `soundEnabled` concept (replaced by `volume: 0` for mute)

## Architecture

### New file: `src/engine/core/SoundManager.ts`

A singleton class (exported as `soundManager`) that:

- Creates and owns one `AudioContext`
- Maintains a master `GainNode` for global volume control
- Exposes `play(sound: SoundEvent)` for one-shot sounds
- Exposes `startSiren()` / `stopSiren()` for the looping background siren
- Exposes `updateSirenSpeed(dotsRemaining: number, totalDots: number)` to ramp siren frequency
- Exposes `setVolume(v: number)` (0–1)
- Exposes `init()` to (re-)create the `AudioContext` after a user gesture (required by browsers)

```
SoundEvent = 'chomp' | 'pellet' | 'eatGhost' | 'death' | 'intro' | 'levelComplete' | 'gameOver'
```

All synthesis uses oscillators and `GainNode` envelopes — no `AudioBuffer` loading.

### Sound synthesis

| Sound | Technique | Duration |
|-------|-----------|----------|
| chomp | Two alternating tones ~180Hz / ~220Hz, short attack/release envelope | ~80ms per dot |
| pellet | Descending tone with vibrato | ~500ms |
| eatGhost | Short ascending tone | ~200ms |
| death | Descending chromatic sequence | ~1500ms |
| intro | 4-note arcade melody | ~4000ms |
| levelComplete | Short ascending jingle | ~1000ms |
| gameOver | Slow descending melody | ~2000ms |
| siren | Sine oscillator loop, frequency interpolates from ~200Hz (full board) to ~600Hz (empty board) | continuous |

### Modified files

**`src/store/settingsStore.ts`**
- Replace `soundEnabled: boolean` with `volume: number` (default `0.7`)
- Replace `toggleSound()` with `setVolume(v: number)`
- Add Zustand `persist` middleware to save `volume` in `localStorage` under key `pac-man-settings`

**`src/engine/core/Game.ts`**
- Import `soundManager`
- Call `soundManager.play('chomp')` when `result.ateDot`
- Call `soundManager.play('pellet')` when `result.atePellet`
- Call `soundManager.play('eatGhost')` when `result.ateGhost !== null`
- Call `soundManager.play('death')` when `result.hitGhost` and lives remain; `soundManager.play('gameOver')` on game over
- Call `soundManager.play('levelComplete')` when `remaining === 0` and level < MAX_LEVELS
- Call `soundManager.updateSirenSpeed(remaining, totalDots)` every frame

**`src/hooks/useGameEngine.ts`**
- Call `soundManager.init()` before creating the `Game` instance
- Call `soundManager.startSiren()` after game starts
- Call `soundManager.stopSiren()` in cleanup
- Subscribe to `volume` from settings store and call `soundManager.setVolume(v)` on change

**`src/routes/settings.tsx`**
- Replace the boolean toggle with `<input type="range" min="0" max="1" step="0.01">`
- Add a speaker icon button that toggles between `volume > 0` and `volume = 0` (stores previous volume to restore)

## Data flow

```
settingsStore.volume
    → soundManager.setVolume()   (via useGameEngine subscription)
    → master GainNode.gain.value

Game.update()
    → result.ateDot → soundManager.play('chomp')
    → result.atePellet → soundManager.play('pellet')
    → result.ateGhost → soundManager.play('eatGhost')
    → result.hitGhost → soundManager.play('death') | play('gameOver')
    → remaining === 0 → soundManager.play('levelComplete') | play('gameOver') [victory]
    → every frame → soundManager.updateSirenSpeed(remaining, total)
```

## Constraints

- `AudioContext` must be created after a user gesture (browser policy) — `init()` is called inside the `useEffect` which fires after the user navigates to the game page
- The siren oscillator is created once in `startSiren()` and its frequency is mutated via `setTargetAtTime` each frame for smooth ramping
- `SoundManager` is a singleton to match the pattern of `renderer` and `inputManager`
- No external packages or audio files are introduced

## Out of scope

- Different sound themes / sound packs
- Per-sound volume control
- Sound for menu navigation clicks
