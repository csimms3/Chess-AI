import { useState } from 'react';
import { AI_OPPONENTS } from './ai';
import { ChessGame } from './components/ChessGame';
import { AISelector } from './components/AISelector';
import type { ChessAI } from './ai';

function App() {
  const [selectedAI, setSelectedAI] = useState<ChessAI | null>(AI_OPPONENTS[0]);

  return (
    <div className="app">
      <header className="header">
        <h1>Chess AI</h1>
        <p className="tagline">Battle the Machines</p>
      </header>

      <main className="main">
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
      </main>
    </div>
  );
}

export default App;
