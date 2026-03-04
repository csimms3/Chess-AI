import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { AI_OPPONENTS } from '../ai';
import type { ChessAI } from '../ai';

const MIN_DELAY = 100;
const MAX_DELAY = 3000;
const DEFAULT_DELAY = 600;

export function AIVsAIGame() {
  const [game, setGame] = useState(() => new Chess());
  const [whiteAI, setWhiteAI] = useState<ChessAI>(AI_OPPONENTS[0]);
  const [blackAI, setBlackAI] = useState<ChessAI>(AI_OPPONENTS[1]);
  const [delayMs, setDelayMs] = useState(DEFAULT_DELAY);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const makeAIMove = useCallback(() => {
    const currentGame = new Chess(game.fen());
    if (currentGame.isGameOver() || currentGame.isDraw()) {
      setIsPlaying(false);
      const winner =
        currentGame.isCheckmate()
          ? currentGame.turn() === 'w'
            ? blackAI.name
            : whiteAI.name
          : null;
      setResult(
        winner
          ? `${winner} wins by checkmate!`
          : 'Draw'
      );
      return;
    }

    const ai = currentGame.turn() === 'w' ? whiteAI : blackAI;
    const move = ai.getMove(currentGame);
    if (!move) {
      setIsPlaying(false);
      setResult('Game over');
      return;
    }

    currentGame.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion ?? 'q',
    });
    setGame(currentGame);
  }, [game, whiteAI, blackAI]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !isMountedRef.current) return;

    const currentGame = new Chess(game.fen());
    if (currentGame.isGameOver() || currentGame.isDraw()) {
      setIsPlaying(false);
      const winner =
        currentGame.isCheckmate()
          ? currentGame.turn() === 'w'
            ? blackAI.name
            : whiteAI.name
          : null;
      setResult(winner ? `${winner} wins by checkmate!` : 'Draw');
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      makeAIMove();
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPlaying, game.fen(), delayMs, makeAIMove, whiteAI, blackAI]);

  const startGame = useCallback(() => {
    setGame(new Chess());
    setResult(null);
    setIsPlaying(true);
  }, []);

  const stopGame = useCallback(() => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    stopGame();
    setGame(new Chess());
    setResult(null);
  }, [stopGame]);

  return (
    <div className="ai-vs-ai">
      <div className="ai-vs-ai-controls">
        <div className="ai-vs-ai-pair">
          <label className="ai-vs-ai-label">
            <span className="ai-vs-ai-color">White</span>
            <select
              value={whiteAI.id}
              onChange={(e) =>
                setWhiteAI(AI_OPPONENTS.find((a) => a.id === e.target.value)!)
              }
              disabled={isPlaying}
              className="ai-vs-ai-select"
            >
              {AI_OPPONENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.rank} {a.name}
                </option>
              ))}
            </select>
          </label>
          <span className="ai-vs-ai-vs">vs</span>
          <label className="ai-vs-ai-label">
            <span className="ai-vs-ai-color">Black</span>
            <select
              value={blackAI.id}
              onChange={(e) =>
                setBlackAI(AI_OPPONENTS.find((a) => a.id === e.target.value)!)
              }
              disabled={isPlaying}
              className="ai-vs-ai-select"
            >
              {AI_OPPONENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.rank} {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="ai-vs-ai-speed">
          <label htmlFor="speed-slider" className="ai-vs-ai-speed-label">
            Speed: <span className="ai-vs-ai-speed-value">{delayMs}ms</span> per move
          </label>
          <input
            id="speed-slider"
            type="range"
            min={MIN_DELAY}
            max={MAX_DELAY}
            step={50}
            value={delayMs}
            onChange={(e) => setDelayMs(Number(e.target.value))}
            className="ai-vs-ai-slider"
          />
        </div>

        <div className="ai-vs-ai-buttons">
          {!isPlaying ? (
            <button type="button" onClick={startGame} className="btn-reset">
              Start Game
            </button>
          ) : (
            <button type="button" onClick={stopGame} className="btn-stop">
              Pause
            </button>
          )}
          <button
            type="button"
            onClick={resetGame}
            className="btn-reset btn-reset-secondary"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="chess-board-wrapper">
        <Chessboard
          id="ai-vs-ai-board"
          position={game.fen()}
          arePiecesDraggable={false}
          boardWidth={480}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
          customDarkSquareStyle={{ backgroundColor: '#2c5282' }}
          customLightSquareStyle={{ backgroundColor: '#edf2f7' }}
        />
      </div>

      {result && (
        <div className="game-over">
          <p>{result}</p>
          <button type="button" onClick={resetGame} className="btn-reset">
            New Game
          </button>
        </div>
      )}
    </div>
  );
}
