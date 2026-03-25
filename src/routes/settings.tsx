import { Link } from '@tanstack/react-router';
import { useSettingsStore } from '@/store/settingsStore';
import { soundManager } from '@/engine/core/SoundManager';

const DIFFICULTIES = ['easy', 'normal', 'hard'] as const;

export default function SettingsPage() {
  const { volume, difficulty, setVolume, mute, unmute, setDifficulty } = useSettingsStore();

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
              soundManager.playPreview();
            }}
            className="w-full accent-[#ffd700] cursor-pointer"
            aria-label="Volume"
          />
          <p className="text-[9px] text-[#333] mt-1 tracking-wider">
            {volume === 0 ? 'MUTED' : `${Math.round(volume * 100)}%`}
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
