import { Link } from '@tanstack/react-router';
import { useSettingsStore } from '@/store/settingsStore';

const DIFFICULTIES = ['easy', 'normal', 'hard'] as const;

export default function SettingsPage() {
  const { soundEnabled, difficulty, toggleSound, setDifficulty } = useSettingsStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 font-mono">
      <div className="w-full max-w-xs">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm">
            ← BACK
          </Link>
          <h1 className="text-2xl font-bold text-yellow-400 tracking-widest">SETTINGS</h1>
        </div>

        {/* Sound toggle */}
        <section className="mb-8">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm tracking-wider">SOUND</span>
            <button
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
              className="relative w-12 h-6 rounded-full transition-colors focus-visible:outline-none"
              style={{ backgroundColor: soundEnabled ? '#facc15' : '#374151' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                style={{ left: soundEnabled ? '1.375rem' : '0.125rem' }}
              />
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {soundEnabled ? 'ON' : 'OFF'}
          </p>
        </section>

        <div className="border-t border-gray-800 mb-8" />

        {/* Difficulty */}
        <section className="mb-8">
          <p className="text-white text-sm tracking-wider mb-3">DIFFICULTY</p>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={[
                  'flex-1 py-2 rounded text-xs uppercase font-bold tracking-wider transition-colors border',
                  difficulty === d
                    ? 'bg-yellow-400 border-yellow-400 text-black'
                    : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-400 hover:text-white',
                ].join(' ')}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <div className="border-t border-gray-800 mb-8" />

        {/* Controls reference */}
        <section>
          <p className="text-white text-sm tracking-wider mb-3">CONTROLS</p>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span className="text-gray-400">MOVE</span>
              <span>↑ ↓ ← →  /  W A S D</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">PAUSE</span>
              <span>P  /  ESC</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
