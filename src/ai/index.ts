import type { ChessAI } from './types';
import { RandomAI } from './engines/random';
import { GreedyAI } from './engines/greedy';
import { MaterialAI } from './engines/material';
import { MinimaxAI } from './engines/minimax';
import { AlphaBetaAI } from './engines/alphabeta';

export const AI_OPPONENTS: ChessAI[] = [
  RandomAI,
  GreedyAI,
  MaterialAI,
  MinimaxAI,
  AlphaBetaAI,
].sort((a, b) => a.rank - b.rank);

export type { ChessAI };
export { RandomAI, GreedyAI, MaterialAI, MinimaxAI, AlphaBetaAI };
