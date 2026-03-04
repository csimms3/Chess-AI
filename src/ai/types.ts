import type { Chess, Square } from 'chess.js';

export type AIMove = {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
};

export interface ChessAI {
  id: string;
  name: string;
  rank: number; // 1 = weakest, higher = stronger
  description: string;
  algorithmSummary: string;
  getMove: (game: Chess) => AIMove | null;
}
