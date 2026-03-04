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

export const MaterialAI: ChessAI = {
  id: 'material',
  name: 'Calculator',
  rank: 3,
  description: 'Material-minded. Evaluates positions by piece values and picks the best immediate move.',
  algorithmSummary: '1-ply minimax: evaluates all legal moves, picks the one maximizing material (from Black\'s perspective, minimizes score). Uses standard piece values.',
  getMove(game) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    const turn = game.turn();
    const isBlack = turn === 'b';

    let bestMove = moves[0];
    let bestScore = isBlack ? Infinity : -Infinity;

    for (const move of moves) {
      game.move(move);
      const score = evaluateBoard(game);
      game.undo();

      const isBetter =
        isBlack ? score < bestScore : score > bestScore;
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
