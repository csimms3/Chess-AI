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

const DEPTH = 3;

function alphaBeta(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) return evaluateBoard(game);

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    if (game.isCheckmate()) return isMaximizing ? -30000 : 30000;
    return evaluateBoard(game);
  }

  if (isMaximizing) {
    let value = -Infinity;
    for (const move of moves) {
      game.move(move);
      value = Math.max(value, alphaBeta(game, depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, value);
      if (beta <= alpha) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (const move of moves) {
      game.move(move);
      value = Math.min(value, alphaBeta(game, depth - 1, alpha, beta, true));
      game.undo();
      beta = Math.min(beta, value);
      if (beta <= alpha) break;
    }
    return value;
  }
}

export const AlphaBetaAI: ChessAI = {
  id: 'alphabeta',
  name: 'Oracle',
  rank: 5,
  description: 'Optimized search. Alpha-beta pruning allows looking 3 moves deep by skipping branches that cannot affect the result.',
  algorithmSummary: 'Alpha-beta pruning with depth 3. Same evaluation as Minimax but prunes irrelevant branches. Typically reduces nodes explored by 40–60%.',
  getMove(game) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    const isMaximizing = game.turn() === 'w';

    let bestMove = moves[0];
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      game.move(move);
      const score = alphaBeta(game, DEPTH - 1, -Infinity, Infinity, !isMaximizing);
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
