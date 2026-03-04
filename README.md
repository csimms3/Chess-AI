# Chess AI

A browser-based chess app with multiple AI opponents, ranked by strength. Play as White against increasingly sophisticated engines.

## Features

- **Full chess rules** — Legal moves, castling, en passant, promotion
- **Drag & drop** — Smooth piece movement with validation
- **5 AI opponents** — Ranked from weakest to strongest:
  - **#1 Chaos** — Random moves
  - **#2 Greed** — Prioritizes captures
  - **#3 Calculator** — 1-ply material evaluation
  - **#4 The Thinker** — Minimax (depth 2)
  - **#5 Oracle** — Alpha-beta pruning (depth 3)
- **Algorithm summaries** — Each AI has an expandable description of its strategy

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech Stack

- React + TypeScript
- Vite
- [chess.js](https://github.com/jhlywa/chess.js) — Game logic
- [react-chessboard](https://github.com/Clariity/react-chessboard) — UI with drag & drop
