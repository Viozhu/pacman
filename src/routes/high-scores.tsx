import { Link } from "@tanstack/react-router";
import { useHighScores } from "@/hooks/useHighScores";
import { HighScoresTable } from "@/components/leaderboard/HighScoresTable";

export default function HighScoresPage() {
  const { data: scores, isLoading, isError } = useHighScores();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 font-mono">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              ← BACK
            </Link>
            <h1 className="text-2xl font-bold text-yellow-400 tracking-widest">
              HIGH SCORES
            </h1>
          </div>
        </div>

        {/* States */}
        {isLoading && (
          <div className="text-center py-10 text-gray-600 text-sm tracking-widest animate-pulse">
            LOADING...
          </div>
        )}

        {isError && (
          <div className="text-center py-10 text-red-500 text-sm">
            Failed to load scores.
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {scores && scores.length > 0 ? (
              <HighScoresTable scores={scores} />
            ) : (
              <div className="text-center py-10 text-gray-700">
                <p className="text-4xl mb-3">🏆</p>
                <p className="text-sm">No scores recorded yet.</p>
                <p className="text-xs mt-1">Complete a game to appear here.</p>
              </div>
            )}
          </>
        )}

        <div className="border-t border-gray-800 mt-6 pt-6 text-center">
          <Link
            to="/game"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-lg tracking-widest transition-colors"
          >
            PLAY NOW
          </Link>
        </div>
      </div>
    </div>
  );
}
