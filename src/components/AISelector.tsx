import type { ChessAI } from '../ai';

interface AISelectorProps {
  opponents: ChessAI[];
  selected: ChessAI | null;
  onSelect: (ai: ChessAI) => void;
}

export function AISelector({ opponents, selected, onSelect }: AISelectorProps) {
  return (
    <div className="ai-selector">
      <h3 className="ai-selector-title">Choose Your Opponent</h3>
      <p className="ai-selector-subtitle">Ranked from weakest to strongest</p>

      <div className="ai-list">
        {opponents.map((ai) => (
          <button
            key={ai.id}
            type="button"
            className={`ai-card ${selected?.id === ai.id ? 'selected' : ''}`}
            onClick={() => onSelect(ai)}
          >
            <div className="ai-rank">#{ai.rank}</div>
            <div className="ai-name">{ai.name}</div>
            <p className="ai-desc">{ai.description}</p>
            <details className="ai-algorithm">
              <summary>Algorithm</summary>
              <p>{ai.algorithmSummary}</p>
            </details>
          </button>
        ))}
      </div>
    </div>
  );
}
