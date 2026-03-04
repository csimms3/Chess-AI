import type { Square } from 'chess.js';
import type { ChessAI } from '../types';

export const RandomAI: ChessAI = {
  id: 'random',
  name: 'Chaos',
  rank: 1,
  description: 'Pure chaos. Makes completely random legal moves with no strategy whatsoever.',
  algorithmSummary: 'Uniform random selection from all legal moves. Time complexity: O(1) per move. No lookahead, no evaluation.',
  getMove(game) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    const move = moves[Math.floor(Math.random() * moves.length)];
    return {
      from: move.from as Square,
      to: move.to as Square,
      promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    };
  },
};
