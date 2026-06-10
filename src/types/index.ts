// MANSA TypeScript Interfaces

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  role: 'user' | 'admin';
  level: number;
  xp: number;
}

export interface Score {
  username: string;
  gameMode: string;
  score: number;
  level: number;
  date: string;
}

export interface Config {
  flashDuration: number;
  gridSize: number;
  difficultyScale: number;
}

export type TrainingFormat = 'arcade' | 'customisable' | 'marathon';
export type TrainingDifficulty = 'standard' | 'hard' | 'extreme';
export type TrainingSkin = 'analogue' | 'digital';
export type DisciplineMode =
  | 'Numbers'
  | 'Names & Faces'
  | 'Words'
  | 'Dates'
  | 'Cards'
  | 'Cards Recall'
  | 'Images'
  | 'Binary';

export type ArcadeMode =
  | 'Grid Flash'
  | 'Number Sequence'
  | 'Card Match'
  | 'Sequence Repeat'
  | 'Speed Numbers';

export type GameMode = ArcadeMode | DisciplineMode | 'Marathon';

export interface TrainingConfig {
  format: TrainingFormat;
  discipline: DisciplineMode;
  difficulty: TrainingDifficulty;
  skin: TrainingSkin;
  amount: number;
  grouping: string;
  memoSeconds: number;
  recallSeconds: number;
}

export interface GameTheme {
  slug: string;
  icon: string;
  accent: string;
  accent2: string;
}

export type ActiveSection =
  | 'home'
  | 'train'
  | 'about'
  | 'login'
  | 'user-dashboard'
  | 'admin-dashboard';

export interface AppState {
  currentUser: User | null;
  activeSection: ActiveSection;
  isSoundOn: boolean;
}

export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SECTION'; payload: ActiveSection }
  | { type: 'TOGGLE_SOUND' };

export interface DifficultyMods {
  seqBonus: number;
  flashMult: number;
  lives: number;
  countdown: number;
  digitBonus: number;
  amountMult: number;
  memoMult: number;
  recallMult: number;
}
