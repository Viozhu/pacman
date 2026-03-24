import { useState, useEffect, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameHUD } from '@/components/game/GameHUD';
import { PauseMenu } from '@/components/game/PauseMenu';
import { useSaveHighScore } from '@/hooks/useHighScores';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import type { GameStatus } from '@/types/game.types';

// ─── Game-over / victory overlay ─────────────────────────────────────────────
// Extracted as its own component so React naturally remounts it on each new
// game-over event — giving fresh local state without needing a useEffect reset.

interface OverlayProps {
  score: number;
  level: number;
  status: GameStatus;
}

function GameOverOverlay({ score, level, status }: OverlayProps) {
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { mutate: saveScore, isPending: isSaving } = useSaveHighScore();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed) return;
    saveScore(
      { playerName: trimmed, score, level },
      { onSuccess: () => setIsSaved(true) },
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 gap-4">
      <h2 className="text-3xl font-bold font-mono text-yellow-400 tracking-widest">
        {status.type === 'victory' ? '🏆 YOU WIN!' : '💀 GAME OVER'}
      </h2>

      <p className="text-white font-mono text-lg tabular-nums">
        {String(score).padStart(6, '0')}
      </p>

      {!isSaved ? (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 w-48">
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={10}
            placeholder="YOUR NAME"
            disabled={isSaving}
            className="w-full bg-black border border-gray-700 focus:border-yellow-400 text-white font-mono text-center py-2 px-3 rounded uppercase tracking-widest text-sm placeholder:normal-case placeholder:text-gray-600 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isSaving || !playerName.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold font-mono py-2 rounded-lg transition-colors text-sm tracking-widest"
          >
            {isSaving ? 'SAVING...' : 'SAVE SCORE'}
          </button>
        </form>
      ) : (
        <p className="text-green-400 font-mono text-sm tracking-wider">✓ SCORE SAVED</p>
      )}

      <div className="flex gap-3 mt-1">
        {isSaved && (
          <Link
            to="/high-scores"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono py-2 px-4 rounded-lg transition-colors text-sm tracking-wider"
          >
            LEADERBOARD
          </Link>
        )}
        <Link
          to="/"
          className="border border-gray-700 hover:border-gray-400 text-gray-400 hover:text-white font-bold font-mono py-2 px-4 rounded-lg transition-colors text-sm tracking-wider"
        >
          MAIN MENU
        </Link>
      </div>
    </div>
  );
}

// ─── Main game page ───────────────────────────────────────────────────────────

export default function GamePage() {
  const status = useGameStore((s) => s.status);
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const isPaused = useUiStore((s) => s.isPaused);
  const togglePause = useUiStore((s) => s.togglePause);
  const setPaused = useUiStore((s) => s.setPaused);

  const isOver = status.type === 'game-over' || status.type === 'victory';

  // P / Escape toggles pause during active gameplay
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && !isOver) {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOver, togglePause]);

  // Clear pause state when leaving the game page
  useEffect(() => {
    return () => setPaused(false);
  }, [setPaused]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-2 p-4">
      <GameHUD />

      <div className="relative">
        <GameCanvas />

        {isPaused && !isOver && <PauseMenu />}

        {isOver && (
          <GameOverOverlay score={score} level={level} status={status} />
        )}
      </div>
    </div>
  );
}
