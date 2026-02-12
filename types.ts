
export enum GameState {
  IDLE = 'IDLE',
  COUNTDOWN = 'COUNTDOWN',
  WAITING = 'WAITING',
  FALLING = 'FALLING',
  STOPPED = 'STOPPED',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER'
}

export interface GameStats {
  reactionTime: number;
  distance: number;
  level: number;
  levelProgress: number; // 0 to 3
  combo: number;
  score: number;
  bestScore: number;
  bestRT: number;
  strikes: number;
}

export type Rating = 'LEGENDARY' | 'ELITE' | 'PRO' | 'AVERAGE' | 'SLOW';
