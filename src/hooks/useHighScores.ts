import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { HighScore } from '@/types/game.types';
import { highScoresService } from '@/services/highScoresService';

export const SCORES_QUERY_KEY = ['highScores'] as const;

export function useHighScores() {
  return useQuery({
    queryKey: SCORES_QUERY_KEY,
    queryFn: () => highScoresService.getHighScores(),
    throwOnError: (error) => { console.error('[useHighScores]', error); return false; },
  });
}

export function useSaveHighScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: Omit<HighScore, 'id' | 'timestamp'>) =>
      highScoresService.saveHighScore(entry),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCORES_QUERY_KEY });
    },
  });
}
