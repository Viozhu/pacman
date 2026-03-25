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
