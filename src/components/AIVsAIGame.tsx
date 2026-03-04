import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { AI_OPPONENTS } from '../ai';
import { useBoardWidth } from '../hooks/useBoardWidth';
import type { ChessAI } from '../ai';

const MIN_DELAY = 100;
const MAX_DELAY = 3000;
const DEFAULT_DELAY = 600;
const MIN_BATCH = 1;
const MAX_BATCH = 1000;
const DEFAULT_BATCH = 10;

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

  const boardWidth = useBoardWidth();
  const [batchCount, setBatchCount] = useState(DEFAULT_BATCH);
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, white: 0, black: 0, draws: 0 });
  const [batchRunId, setBatchRunId] = useState(0);
  const batchCancelRef = useRef(false);
  const batchRunningRef = useRef(false);

  const runBatch = useCallback(() => {
    if (batchRunningRef.current) return;
    batchRunningRef.current = true;
    batchCancelRef.current = false;
    setBatchRunId((id) => id + 1);
    setBatchProgress({ completed: 0, white: 0, black: 0, draws: 0 });
    setIsRunningBatch(true);

    const total = Math.max(MIN_BATCH, Math.min(MAX_BATCH, batchCount));
    const white = whiteAI;
    const black = blackAI;

    const runNextGame = (
      gameIndex: number,
      ai1Wins: number,
      ai2Wins: number,
      draws: number
    ) => {
      if (batchCancelRef.current || gameIndex >= total) {
        batchRunningRef.current = false;
        setIsRunningBatch(false);
        return;
      }

      const swapColors = gameIndex % 2 === 1;
      const w = swapColors ? black : white;
      const b = swapColors ? white : black;

      const g = new Chess();
      while (!g.isGameOver() && !g.isDraw()) {
        const ai = g.turn() === 'w' ? w : b;
        const move = ai.getMove(g);
        if (!move) break;
        g.move({ from: move.from, to: move.to, promotion: move.promotion ?? 'q' });
      }

      let newAi1 = ai1Wins;
      let newAi2 = ai2Wins;
      let newDraws = draws;
      if (g.isCheckmate()) {
        const whiteWon = g.turn() === 'b';
        if (swapColors) {
          whiteWon ? newAi2++ : newAi1++;
        } else {
          whiteWon ? newAi1++ : newAi2++;
        }
      } else {
        newDraws++;
      }

      const nextProgress = {
        completed: gameIndex + 1,
        white: newAi1,
        black: newAi2,
        draws: newDraws,
      };
      setBatchProgress(nextProgress);
      requestAnimationFrame(() => {
        if (batchCancelRef.current) return;
        setTimeout(() => runNextGame(gameIndex + 1, newAi1, newAi2, newDraws), 0);
      });
    };

    requestAnimationFrame(() => runNextGame(0, 0, 0, 0));
  }, [batchCount, whiteAI, blackAI]);

  const cancelBatch = useCallback(() => {
    batchCancelRef.current = true;
  }, []);

  // Reset batch ref if component unmounts or batch was cancelled/completed
  useEffect(() => {
    if (!isRunningBatch) {
      batchRunningRef.current = false;
    }
  }, [isRunningBatch]);

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

      <div className="ai-vs-ai-batch">
        <div className="ai-vs-ai-batch-header">
          <h4>Batch games</h4>
          <p className="ai-vs-ai-batch-desc">Run many games at maximum speed</p>
        </div>
        <div className="ai-vs-ai-batch-controls">
          <label className="ai-vs-ai-batch-label">
            <span>Games</span>
            <input
              type="number"
              min={MIN_BATCH}
              max={MAX_BATCH}
              value={batchCount}
              onChange={(e) => setBatchCount(Math.max(MIN_BATCH, Math.min(MAX_BATCH, Number(e.target.value) || MIN_BATCH)))}
              disabled={isRunningBatch}
              className="ai-vs-ai-batch-input"
            />
          </label>
          {!isRunningBatch ? (
            <button
              type="button"
              onClick={runBatch}
              disabled={isPlaying}
              className="btn-reset"
            >
              Run batch
            </button>
          ) : (
            <button type="button" onClick={cancelBatch} className="btn-stop">
              Cancel
            </button>
          )}
        </div>
        {(batchProgress.completed > 0 || isRunningBatch) && (
          <div key={batchRunId} className="ai-vs-ai-batch-results">
            <div className="ai-vs-ai-batch-progress">
              {isRunningBatch
                ? `Game ${batchProgress.completed} / ${batchCount}`
                : `Complete: ${batchProgress.completed} games`}
            </div>
            <div className="ai-vs-ai-batch-bar">
              {(() => {
                const total = batchProgress.white + batchProgress.black + batchProgress.draws;
                if (total === 0) return null;
                return (
                  <>
                    <div
                      className="ai-vs-ai-bar-segment ai-vs-ai-bar-white"
                      style={{ width: `${(batchProgress.white / total) * 100}%` }}
                      title={`${whiteAI.name}: ${batchProgress.white}`}
                    />
                    <div
                      className="ai-vs-ai-bar-segment ai-vs-ai-bar-black"
                      style={{ width: `${(batchProgress.black / total) * 100}%` }}
                      title={`${blackAI.name}: ${batchProgress.black}`}
                    />
                    <div
                      className="ai-vs-ai-bar-segment ai-vs-ai-bar-draw"
                      style={{ width: `${(batchProgress.draws / total) * 100}%` }}
                      title={`Draws: ${batchProgress.draws}`}
                    />
                  </>
                );
              })()}
            </div>
            <div className="ai-vs-ai-batch-legend">
              <span className="ai-vs-ai-legend-item">
                <span className="ai-vs-ai-legend-dot ai-vs-ai-legend-white" />
                {whiteAI.name}: {batchProgress.white}
              </span>
              <span className="ai-vs-ai-legend-item">
                <span className="ai-vs-ai-legend-dot ai-vs-ai-legend-black" />
                {blackAI.name}: {batchProgress.black}
              </span>
              <span className="ai-vs-ai-legend-item">
                <span className="ai-vs-ai-legend-dot ai-vs-ai-legend-draw" />
                Draws: {batchProgress.draws}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="chess-board-wrapper">
        <Chessboard
          id="ai-vs-ai-board"
          position={game.fen()}
          arePiecesDraggable={false}
          boardWidth={boardWidth}
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
