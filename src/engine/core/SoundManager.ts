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
  private lastPreviewTime = 0;
  private visibilityHandler: (() => void) | null = null;

  init(): void {
    this.stopSiren();
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
      case 'chomp':         this.playChomp();         break;
      case 'pellet':        this.playPellet();        break;
      case 'eatGhost':      this.playEatGhost();      break;
      case 'death':         this.playDeath();         break;
      case 'intro':         this.playIntro();         break;
      case 'levelComplete': this.playLevelComplete(); break;
      case 'victory':       this.playVictory();       break;
      case 'gameOver':      this.playGameOver();      break;
    }
  }

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

  destroy(): void {
    this.stopSiren();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => undefined);
      this.ctx = null;
      this.masterGain = null;
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
