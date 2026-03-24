import { supabase } from '@/lib/supabase';
import type { HighScore } from '@/types/game.types';

export const highScoresService = {
  async getHighScores(): Promise<HighScore[]> {
    const { data, error } = await supabase
      .from('high_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data.map(row => ({
      id: row.id as string,
      playerName: row.player_name as string,
      score: row.score as number,
      level: row.level as number,
      timestamp: row.timestamp as number,
    }));
  },

  async saveHighScore(entry: Omit<HighScore, 'id' | 'timestamp'>): Promise<HighScore> {
    const timestamp = Date.now();
    const { data, error } = await supabase
      .from('high_scores')
      .insert({ player_name: entry.playerName, score: entry.score, level: entry.level, timestamp })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id as string,
      playerName: data.player_name as string,
      score: data.score as number,
      level: data.level as number,
      timestamp: data.timestamp as number,
    };
  },

  async clearHighScores(): Promise<void> {
    const { error } = await supabase.from('high_scores').delete().neq('id', '');
    if (error) throw new Error(error.message);
  },
};
