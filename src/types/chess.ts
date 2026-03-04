export type ChessMove = {
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
};

export type BoardPosition = Record<string, string>;
