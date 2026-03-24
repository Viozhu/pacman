import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';

export function GameHUD() {
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const level = useGameStore((s) => s.level);
  const togglePause = useUiStore((s) => s.togglePause);
  const isPaused = useUiStore((s) => s.isPaused);

  return (
    <div className="flex items-center justify-between w-full max-w-[448px] px-2 py-2 text-white font-mono">
      <span className="text-yellow-400 font-bold text-lg">
        {String(score).padStart(6, '0')}
      </span>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-400">LV {level}</span>
        <span className="text-yellow-400">
          {'●'.repeat(Math.max(0, lives))}
        </span>
      </div>

      <button
        onClick={togglePause}
        className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded border border-gray-700 hover:border-gray-500"
      >
        {isPaused ? '▶ resume' : '⏸ pause'}
      </button>
    </div>
  );
}
