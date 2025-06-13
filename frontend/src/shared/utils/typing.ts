export const calcGrossWpm = (chars: number, ms: number) =>
  ms ? (chars / 5) / (ms / 60000) : 0;

export const calcNetWpm = (grossWpm: number, accuracy: number) =>
  Math.max(grossWpm * accuracy / 100, 0);

export const calcAccuracy = (correct: number, total: number) =>
  total ? Math.round((correct / total) * 100) : 100; 