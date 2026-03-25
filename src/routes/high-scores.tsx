import { Link } from "@tanstack/react-router";
import { useHighScores } from "@/hooks/useHighScores";
import { HighScoresTable } from "@/components/leaderboard/HighScoresTable";

export default function HighScoresPage() {
  const { data: scores, isLoading, isError } = useHighScores();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            to="/"
            className="text-[#555] hover:text-white transition-colors text-[10px] tracking-wider"
          >
            ← BACK
          </Link>
          <h1
            className="text-xl text-[#ffd700] tracking-widest"
            style={{ textShadow: '0 0 8px #ffd700, 0 0 20px #ffd700' }}
          >
            HIGH SCORES
          </h1>
        </div>

        {isLoading && (
          <div className="text-center py-10 text-[#ffd700] text-[10px] tracking-widest [animation:var(--animate-blink)]">
            LOADING...
          </div>
        )}

        {isError && (
          <div className="text-center py-10 text-[#ff0000] text-[10px]">
            FAILED TO LOAD SCORES.
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {scores && scores.length > 0 ? (
              <HighScoresTable scores={scores} />
            ) : (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">🏆</p>
                <p className="text-[#333] text-[10px] mb-1">NO SCORES RECORDED YET.</p>
                <p className="text-[#222] text-[9px]">COMPLETE A GAME TO APPEAR HERE.</p>
              </div>
            )}
          </>
        )}

        <div className="border-t border-[#111] mt-6 pt-6 text-center">
          <Link
            to="/game"
            className="text-black font-bold py-2 px-6 text-[10px] tracking-widest transition-all hover:brightness-110 inline-block"
            style={{
              background: '#ffd700',
              boxShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)',
            }}
          >
            ▶ PLAY NOW
          </Link>
        </div>
      </div>
    </div>
  );
}
