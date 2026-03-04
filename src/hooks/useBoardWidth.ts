import { useState, useEffect } from 'react';

const MAX_BOARD = 480;
const MIN_BOARD = 240;
const PADDING = 64;

export function useBoardWidth(): number {
  const [width, setWidth] = useState(MAX_BOARD);

  useEffect(() => {
    const update = () =>
      setWidth(
        Math.min(
          MAX_BOARD,
          Math.max(MIN_BOARD, (typeof window !== 'undefined' ? window.innerWidth : 800) - PADDING)
        )
      );
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return width;
}
