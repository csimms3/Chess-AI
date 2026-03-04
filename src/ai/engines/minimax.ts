import type { Chess, Square } from 'chess.js';
import type { ChessAI } from '../types';

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

function evaluateBoard(game: Chess): number {
  const fen = game.fen();
  let score = 0;
  for (const char of fen.split(' ')[0]) {
    if (char === '/' || char === ' ') continue;
    if (char >= '1' && char <= '8') continue;
    const piece = char.toLowerCase();
    const value = PIECE_VALUES[piece] ?? 0;
    score += char === piece ? -value : value;
  }
  return score;
}

const DEPTH = 2;

function minimax(game: Chess, depth: number, isMaximizing: boolean): number {
  if (depth === 0) return evaluateBoard(game);

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    if (game.isCheckmate()) return isMaximizing ? -30000 : 30000;
    return evaluateBoard(game);
  }

  let best = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move);
    const score = minimax(game, depth - 1, !isMaximizing);
    game.undo();
    best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
  }

  return best;
}

export const MinimaxAI: ChessAI = {
  id: 'minimax',
  name: 'The Thinker',
  rank: 4,
  description: 'Classic game theory. Uses minimax to look 2 moves ahead, assuming optimal play from both sides.',
  algorithmSummary: 'Minimax algorithm with depth 2. Alternates min/max; White maximizes material score, Black minimizes. Full breadth search—no pruning.',
  getMove(game) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    const isMaximizing = game.turn() === 'w';

    let bestMove = moves[0];
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      game.move(move);
      const score = minimax(game, DEPTH - 1, !isMaximizing);
      game.undo();

      const isBetter =
        isMaximizing ? score > bestScore : score < bestScore;
      if (isBetter) {
        bestScore = score;
        bestMove = move;
      }
    }

    return {
      from: bestMove.from as Square,
      to: bestMove.to as Square,
      promotion: bestMove.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    };
  },
};
