import { useState } from 'react';
import { AI_OPPONENTS } from './ai';
import { ChessGame } from './components/ChessGame';
import { AISelector } from './components/AISelector';
import { AIVsAIGame } from './components/AIVsAIGame';
import type { ChessAI } from './ai';

type Mode = 'play' | 'watch';

function App() {
  const [mode, setMode] = useState<Mode>('play');
  const [selectedAI, setSelectedAI] = useState<ChessAI | null>(AI_OPPONENTS[0]);

  return (
    <div className="app">
      <header className="header">
        <h1>Chess AI</h1>
        <p className="tagline">Battle the Machines</p>
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'play' ? 'active' : ''}`}
            onClick={() => setMode('play')}
          >
            Play vs AI
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'watch' ? 'active' : ''}`}
            onClick={() => setMode('watch')}
          >
            AI vs AI
          </button>
        </div>
      </header>

      <main className="main">
        {mode === 'play' && (
          <>
            <aside className="sidebar">
              <AISelector
                opponents={AI_OPPONENTS}
                selected={selectedAI}
                onSelect={setSelectedAI}
              />
            </aside>
            <section className="game-section">
              {selectedAI ? (
                <>
                  <div className="opponent-badge">
                    <span className="opponent-rank">#{selectedAI.rank}</span>
                    <span className="opponent-name">{selectedAI.name}</span>
                  </div>
                  <ChessGame ai={selectedAI} />
                </>
              ) : (
                <div className="placeholder">
                  <p>Select an opponent to begin</p>
                </div>
              )}
            </section>
          </>
        )}

        {mode === 'watch' && (
          <section className="game-section game-section-full">
            <AIVsAIGame />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
