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
