import { Link } from '@tanstack/react-router';

const DOTS = ['●', '●', '●', '●', '●'];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 font-mono select-none">
      {/* Title block */}
      <div className="mb-10 text-center">
        <h1 className="text-6xl font-bold text-yellow-400 tracking-widest mb-3">
          PAC-MAN
        </h1>

        {/* Animated row: ghost ● ghost ● ... ○ ghost */}
        <div className="flex items-center justify-center gap-2 text-2xl mt-4">
          <span className="text-red-500">👻</span>
          {DOTS.map((d, i) => (
            <span key={i} className="text-yellow-600 text-sm">
              {d}
            </span>
          ))}
          <span className="text-yellow-400 text-3xl">●</span>
          {DOTS.map((d, i) => (
            <span key={i + 5} className="text-yellow-600 text-sm">
              {d}
            </span>
          ))}
          <span className="text-pink-400">👻</span>
          <span className="text-cyan-400">👻</span>
          <span className="text-orange-400">👻</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-3 w-64">
        <Link
          to="/game"
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-6 rounded-lg text-center text-lg tracking-widest transition-colors"
        >
          START GAME
        </Link>
        <Link
          to="/high-scores"
          className="border-2 border-blue-500 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-bold py-3 px-6 rounded-lg text-center tracking-widest transition-colors"
        >
          HIGH SCORES
        </Link>
        <Link
          to="/settings"
          className="border-2 border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 font-bold py-3 px-6 rounded-lg text-center tracking-widest transition-colors"
        >
          SETTINGS
        </Link>
      </nav>

      {/* Controls hint */}
      <p className="mt-12 text-xs text-gray-700 tracking-wider">
        ARROW KEYS / WASD TO MOVE · P TO PAUSE
      </p>
    </div>
  );
}
