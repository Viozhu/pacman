# Settings UX Improvements Design

**Date:** 2026-03-25
**Status:** Approved

## Overview

Two small improvements to the Settings page sound controls:

1. Replace emoji speaker icons (🔊/🔇) with 8-bit pixel SVG icons matching the retro arcade aesthetic.
2. Play a short preview tone when the user drags the volume slider, so they can hear the current volume level in real time.

## Changes

### 1. SVG Speaker Icons

Replace the emoji `🔊` and `🔇` in `src/routes/settings.tsx` with inline SVG.

**Spec: Active icon (volume > 0)**
- `width="16" height="16"`, `viewBox="0 0 10 10"`, `style="image-rendering:pixelated"`
- Fill: `#ffd700` (gold)
- Speaker body: two rects forming a blocky speaker
- Sound wave arcs: three stepped rect arcs to the right of the body

SVG rects:
```
<rect x="1" y="3" width="2" height="4"/>   <!-- speaker body left -->
<rect x="3" y="2" width="1" height="6"/>   <!-- speaker body right -->
<rect x="4" y="1" width="1" height="8"/>   <!-- horn -->
<rect x="6" y="3" width="1" height="1"/>   <!-- arc 1 top -->
<rect x="7" y="2" width="1" height="2"/>   <!-- arc 2 top -->
<rect x="6" y="5" width="1" height="1"/>   <!-- arc 1 bottom -->
<rect x="7" y="5" width="1" height="2"/>   <!-- arc 2 bottom -->
<rect x="8" y="1" width="1" height="1"/>   <!-- arc 3 top -->
<rect x="8" y="7" width="1" height="1"/>   <!-- arc 3 bottom -->
```

**Spec: Muted icon (volume === 0)**
- Same viewBox and size
- Speaker body rects: fill `#555` (gray)
- X mark: 5 unique pixel positions forming a symmetric 3×3 pixel X (two diagonals share the center pixel at 7,4), fill `#ff4444`

SVG rects:
```
<!-- speaker body (gray) -->
<rect x="1" y="3" width="2" height="4" fill="#555"/>
<rect x="3" y="2" width="1" height="6" fill="#555"/>
<rect x="4" y="1" width="1" height="8" fill="#555"/>
<!-- X mark (red) — diagonal ↘: (6,3)→(7,4)→(8,5); anti-diagonal ↗: (6,5)→(7,4)→(8,3); center (7,4) shared -->
<rect x="6" y="3" width="1" height="1" fill="#ff4444"/>
<rect x="7" y="4" width="1" height="1" fill="#ff4444"/>
<rect x="8" y="5" width="1" height="1" fill="#ff4444"/>
<rect x="6" y="5" width="1" height="1" fill="#ff4444"/>
<rect x="8" y="3" width="1" height="1" fill="#ff4444"/>
```

The button wrapper keeps the same className and aria-label as before.

### 2. Volume Preview Sound

Add `playPreview()` to `SoundManager`:

- Plays a single `OscillatorNode` at 440Hz with `type: 'square'`
- Signal chain: `osc → gain → masterGain` (same pattern as every other synthesis helper in `SoundManager.ts`)
- Envelope: `gain.gain.setValueAtTime(0.25, now)` then `exponentialRampToValueAtTime(0.001, now + 0.08)` — initial value 0.25, fades to near-silence over 80ms (matches rest of codebase; avoids click artifact from ramping to exact zero)
- Stop the oscillator: `osc.stop(ctx.currentTime + 0.08)` — must match the envelope duration to prevent resource leak
- The note plays through the master `GainNode` (so current volume applies)
- Throttle guard: stores `lastPreviewTime` (number, initialized to 0). If `Date.now() - lastPreviewTime < 150`, silently no-ops. Otherwise plays and updates `lastPreviewTime`.
- If `ctx` is null or `masterGain` is null, silently no-ops (same guard as `play()`). If `ctx` is non-null but suspended, the oscillator will be scheduled but produce no sound — this is the same known limitation as `play()` and is acceptable behavior.

In `src/routes/settings.tsx`, the slider `onChange` handler already calls `setVolume(v)` and `soundManager.setVolume(v)` (lines 54-56). The only code change needed is appending `soundManager.playPreview()` as a third call after the existing two. The ordering is critical — master gain must be updated first:
1. `setVolume(v)` — update store *(already exists)*
2. `soundManager.setVolume(v)` — update master gain immediately *(already exists)*
3. `soundManager.playPreview()` — play preview at new volume *(new)*

The mute/unmute toggle button does **not** call `playPreview()`. Preview sound is only triggered by slider interaction.

## Files Modified

- `src/engine/core/SoundManager.ts` — add `playPreview()` method and `lastPreviewTime` private field
- `src/routes/settings.tsx` — replace emoji with inline SVG; call `soundManager.playPreview()` in slider onChange

## Constraints

- No new files
- No new store fields
- `playPreview()` is not part of `SoundEvent` — it is a direct method call
- Preview sound plays through the master gain, so it respects the current volume being set
