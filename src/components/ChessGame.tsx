import { useState, useCallback } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { ChessAI } from '../ai';

interface ChessGameProps {
  ai: ChessAI;
}

export function ChessGame({ ai }: ChessGameProps) {
  const [game, setGame] = useState(() => new Chess());
  const [gameOver, setGameOver] = useState(false);

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move({
        from: from as Square,
        to: to as Square,
        promotion: (promotion as 'q' | 'r' | 'b' | 'n') ?? 'q',
      });

      if (result) {
        setGame(gameCopy);
        if (gameCopy.isGameOver() || gameCopy.isDraw()) {
          setGameOver(true);
          return result;
        }

        if (gameCopy.turn() === 'b') {
          setTimeout(() => {
            const aiMove = ai.getMove(gameCopy);
            if (aiMove) {
              const nextGame = new Chess(gameCopy.fen());
              nextGame.move({
                from: aiMove.from,
                to: aiMove.to,
                promotion: aiMove.promotion ?? 'q',
              });
              setGame(nextGame);
              if (nextGame.isGameOver() || nextGame.isDraw()) {
                setGameOver(true);
              }
            }
          }, 400);
        }
        return result;
      }
      return null;
    },
    [game, ai]
  );

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string) => {
      if (game.turn() !== 'w' || piece[0] !== 'w') return false;
      const isPromotion =
        piece[1] === 'P' &&
        (targetSquare[1] === '8' || targetSquare[1] === '1');
      if (isPromotion) return true;
      const result = makeMove(sourceSquare, targetSquare);
      return !!result;
    },
    [game, makeMove]
  );

  const onPromotionCheck = useCallback(
    (_sourceSquare: string, targetSquare: string, piece: string) =>
      game.turn() === 'w' &&
      piece[1] === 'P' &&
      (targetSquare[1] === '8' || targetSquare[1] === '1'),
    [game]
  );

  const onPromotionPieceSelect = useCallback(
    (
      piece?: string,
      promoteFromSquare?: string,
      promoteToSquare?: string
    ) => {
      if (!piece || !promoteFromSquare || !promoteToSquare || game.turn() !== 'w')
        return false;
      const promo = piece.toLowerCase()[1] as 'q' | 'r' | 'b' | 'n';
      const result = makeMove(promoteFromSquare, promoteToSquare, promo);
      return !!result;
    },
    [game, makeMove]
  );

  const resetGame = useCallback(() => {
    setGame(new Chess());
    setGameOver(false);
  }, []);

  const position = game.fen();

  return (
    <div className="chess-game">
      <div className="chess-board-wrapper">
        <Chessboard
          id="main-board"
          position={position}
          arePiecesDraggable={game.turn() === 'w' && !gameOver}
          onPieceDrop={onDrop}
          onPromotionCheck={onPromotionCheck}
          onPromotionPieceSelect={onPromotionPieceSelect}
          boardWidth={480}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
          customDarkSquareStyle={{ backgroundColor: '#2c5282' }}
          customLightSquareStyle={{ backgroundColor: '#edf2f7' }}
          customDropSquareStyle={{
            boxShadow: 'inset 0 0 1px 6px rgba(250,204,21,0.8)',
          }}
          showPromotionDialog
        />
      </div>

      <div className="game-status">
        {gameOver && (
          <div className="game-over">
            <p>
              {game.isCheckmate()
                ? `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`
                : game.isDraw()
                ? 'Draw'
                : 'Game over'}
            </p>
            <button type="button" onClick={resetGame} className="btn-reset">
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
