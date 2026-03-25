# Settings UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `playPreview()` to SoundManager and replace emoji speaker icons with 8-bit pixel SVGs in the Settings page.

**Architecture:** Two isolated changes to two files. No new files, no new store fields, no new dependencies.

**Tech Stack:** TypeScript, React 19, Web Audio API, Tailwind CSS v4

---

## File Map

- Modify: `src/engine/core/SoundManager.ts` — add `private lastPreviewTime = 0` field and `playPreview()` public method
- Modify: `src/routes/settings.tsx` — replace emoji JSX with inline SVG; append `soundManager.playPreview()` to slider `onChange`

---

### Task 1: Add `playPreview()` to SoundManager

**Files:**
- Modify: `src/engine/core/SoundManager.ts`

Read the file first to find the right insertion points before making any edits.

- [ ] **Step 1: Add `lastPreviewTime` private field**

In `SoundManager` class, alongside the other private fields (e.g., near `chompToggle`), add:

```typescript
private lastPreviewTime = 0;
```

- [ ] **Step 2: Add `playPreview()` public method**

Add this method to the `SoundManager` class, after the `play()` method:

```typescript
playPreview(): void {
  if (!this.ctx || !this.masterGain) return;
  const now = Date.now();
  if (now - this.lastPreviewTime < 150) return;
  this.lastPreviewTime = now;

  const ctx = this.ctx;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.value = 440;
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

  osc.connect(gain);
  gain.connect(this.masterGain);

  osc.start(t);
  osc.stop(t + 0.08);
}
```

- [ ] **Step 3: Verify types compile**

```bash
cd /Users/jorgeignaciogaray/Workspace/Projects/test-claude && pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Lint**

```bash
pnpm lint
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/engine/core/SoundManager.ts
git commit -m "feat: add playPreview() to SoundManager for volume slider feedback"
```

---

### Task 2: Replace emoji icons and wire preview sound in Settings

**Files:**
- Modify: `src/routes/settings.tsx`

Read the file first. The mute button is around line 30-45. The slider onChange is around line 53-57.

- [ ] **Step 1: Replace mute button emoji with SVG icons**

Replace the button's child content. Currently:
```tsx
{volume > 0 ? '🔊' : '🔇'}
```

Replace with:
```tsx
{volume > 0 ? (
  <svg width="16" height="16" viewBox="0 0 10 10" style={{ imageRendering: 'pixelated' }} fill="#ffd700">
    <rect x="1" y="3" width="2" height="4"/>
    <rect x="3" y="2" width="1" height="6"/>
    <rect x="4" y="1" width="1" height="8"/>
    <rect x="6" y="3" width="1" height="1"/>
    <rect x="7" y="2" width="1" height="2"/>
    <rect x="6" y="5" width="1" height="1"/>
    <rect x="7" y="5" width="1" height="2"/>
    <rect x="8" y="1" width="1" height="1"/>
    <rect x="8" y="7" width="1" height="1"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 10 10" style={{ imageRendering: 'pixelated' }}>
    <rect x="1" y="3" width="2" height="4" fill="#555"/>
    <rect x="3" y="2" width="1" height="6" fill="#555"/>
    <rect x="4" y="1" width="1" height="8" fill="#555"/>
    <rect x="6" y="3" width="1" height="1" fill="#ff4444"/>
    <rect x="7" y="4" width="1" height="1" fill="#ff4444"/>
    <rect x="8" y="5" width="1" height="1" fill="#ff4444"/>
    <rect x="6" y="5" width="1" height="1" fill="#ff4444"/>
    <rect x="8" y="3" width="1" height="1" fill="#ff4444"/>
  </svg>
)}
```

- [ ] **Step 2: Append `playPreview()` to the slider onChange**

The existing onChange handler (around line 53-57) already has:
```tsx
onChange={(e) => {
  const v = parseFloat(e.target.value);
  setVolume(v);
  soundManager.setVolume(v);
}}
```

Append `soundManager.playPreview()` as the third call (after `soundManager.setVolume(v)`):
```tsx
onChange={(e) => {
  const v = parseFloat(e.target.value);
  setVolume(v);
  soundManager.setVolume(v);
  soundManager.playPreview();
}}
```

- [ ] **Step 3: Verify types compile**

```bash
cd /Users/jorgeignaciogaray/Workspace/Projects/test-claude && pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Lint**

```bash
pnpm lint
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/routes/settings.tsx
git commit -m "feat: replace emoji speaker icons with 8-bit SVG and add volume preview sound"
```
