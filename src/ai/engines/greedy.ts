import type { Square } from 'chess.js';
import type { ChessAI } from '../types';

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

export const GreedyAI: ChessAI = {
  id: 'greedy',
  name: 'Greed',
  rank: 2,
  description: 'Opportunistic. Always captures when possible, prefers high-value pieces. Otherwise moves randomly.',
  algorithmSummary: 'Filters moves: prioritizes captures by captured piece value. Non-captures chosen randomly. Material-only evaluation.',
  getMove(game) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    const captures = moves.filter((m) => m.captured);
    if (captures.length > 0) {
      const best = captures.reduce((a, b) =>
        (PIECE_VALUES[b.captured ?? ''] ?? 0) > (PIECE_VALUES[a.captured ?? ''] ?? 0)
          ? b
          : a,
      );
      return {
        from: best.from as Square,
        to: best.to as Square,
        promotion: best.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      };
    }

    const move = moves[Math.floor(Math.random() * moves.length)];
    return {
      from: move.from as Square,
      to: move.to as Square,
      promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    };
  },
};
