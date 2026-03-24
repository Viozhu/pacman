import { Link } from '@tanstack/react-router';
import { useUiStore } from '@/store/uiStore';

export function PauseMenu() {
  const setPaused = useUiStore((s) => s.setPaused);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 gap-6">
      <h2 className="text-4xl font-bold font-mono text-yellow-400 tracking-widest">
        PAUSED
      </h2>

      <div className="flex flex-col gap-3 w-44">
        <button
          onClick={() => setPaused(false)}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold font-mono py-2 px-6 rounded-lg transition-colors"
        >
          ▶ RESUME
        </button>
        <Link
          to="/"
          className="border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white font-bold font-mono py-2 px-6 rounded-lg text-center transition-colors"
        >
          MAIN MENU
        </Link>
      </div>

      <div className="text-xs font-mono text-center space-y-1 text-gray-500 mt-2">
        <p className="text-gray-400 font-bold mb-2 tracking-widest">CONTROLS</p>
        <p>↑ ↓ ← →  /  W A S D — Move</p>
        <p>P  /  ESC — Pause</p>
      </div>
    </div>
  );
}
