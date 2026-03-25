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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4">
      <h2
        className="text-2xl tracking-widest"
        style={
          status.type === 'victory'
            ? { color: '#ffd700', animation: 'glow-pulse 1.5s infinite', textShadow: '0 0 8px #ffd700, 0 0 20px #ffd700' }
            : { color: '#ff0000', textShadow: '0 0 8px #ff0000, 0 0 20px #ff0000' }
        }
      >
        {status.type === 'victory' ? 'YOU WIN!' : 'GAME OVER'}
      </h2>

      <p
        className="text-[#ffd700] text-xl tabular-nums"
        style={{ textShadow: '0 0 8px #ffd700' }}
      >
        {String(score).padStart(6, '0')}
      </p>

      {!isSaved ? (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-48">
          <p className="text-[10px] text-[#ffd700] [animation:var(--animate-blink)]">
            ENTER YOUR INITIALS
          </p>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={10}
            placeholder="YOUR NAME"
            disabled={isSaving}
            className="w-full bg-black border-2 border-[#333] focus:border-[#ffd700] text-white text-center py-2 px-3 uppercase tracking-widest text-[10px] placeholder:text-[#333] placeholder:normal-case outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isSaving || !playerName.trim()}
            className="w-full text-black font-bold py-2 text-[10px] tracking-widest disabled:opacity-40 transition-all hover:brightness-110"
            style={{
              background: '#ffd700',
              boxShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)',
            }}
          >
            {isSaving ? 'SAVING...' : 'SAVE SCORE'}
          </button>
        </form>
      ) : (
        <p className="text-green-400 text-[10px] tracking-wider">✓ SCORE SAVED</p>
      )}

      <div className="flex gap-3 mt-1">
        {isSaved && (
          <Link
            to="/high-scores"
            className="text-white text-[10px] py-2 px-4 tracking-wider transition-all hover:brightness-125"
            style={{
              background: '#0066cc',
              boxShadow: '0 0 6px rgba(0,128,255,0.5)',
            }}
          >
            LEADERBOARD
          </Link>
        )}
        <Link
          to="/"
          className="border border-[#333] text-[#555] hover:border-[#555] hover:text-white py-2 px-4 text-[10px] tracking-wider transition-colors"
        >
          ← MAIN MENU
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
