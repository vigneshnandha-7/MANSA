import { User, Score, Config } from '../types';

const DB_KEYS = {
  USERS: 'mansa_users',
  SCORES: 'mansa_scores',
  CONFIG: 'mansa_config',
  CURRENT_USER: 'mansa_active_user',
} as const;

const DEFAULT_CONFIG: Config = {
  flashDuration: 800,
  gridSize: 4,
  difficultyScale: 1.35,
};

const INITIAL_USERS: User[] = [
  { id: 'usr-1', email: 'user@mansa.gg', password: 'password', username: 'AlphaRecall', role: 'user', level: 5, xp: 650 },
  { id: 'usr-2', email: 'gamer@mansa.gg', password: 'password', username: 'NeuronTrigger', role: 'user', level: 3, xp: 200 },
  { id: 'adm-1', email: 'admin@mansa.gg', password: 'adminpass', username: 'Mansa_Overlord', role: 'admin', level: 99, xp: 0 },
];

const INITIAL_SCORES: Score[] = [
  { username: 'AlphaRecall', gameMode: 'Grid Flash', score: 24500, level: 8, date: '2026-06-05' },
  { username: 'NeuronTrigger', gameMode: 'Grid Flash', score: 14200, level: 5, date: '2026-06-07' },
  { username: 'AlphaRecall', gameMode: 'Number Sequence', score: 18400, level: 7, date: '2026-06-07' },
  { username: 'BetaRecall', gameMode: 'Grid Flash', score: 9800, level: 3, date: '2026-06-08' },
];

export function initDatabase(): void {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(DB_KEYS.SCORES)) {
    localStorage.setItem(DB_KEYS.SCORES, JSON.stringify(INITIAL_SCORES));
  }
  if (!localStorage.getItem(DB_KEYS.CONFIG)) {
    localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
  }
}

export const DB = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'),
  saveUsers: (users: User[]): void => localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users)),
  getScores: (): Score[] => JSON.parse(localStorage.getItem(DB_KEYS.SCORES) || '[]'),
  addScore: (scoreObj: Score): void => {
    const scores = DB.getScores();
    scores.unshift(scoreObj);
    localStorage.setItem(DB_KEYS.SCORES, JSON.stringify(scores));
  },
  getConfig: (): Config => JSON.parse(localStorage.getItem(DB_KEYS.CONFIG) || JSON.stringify(DEFAULT_CONFIG)),
  saveConfig: (cfg: Config): void => localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(cfg)),
  getCurrentUser: (): User | null => {
    const raw = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },
  setCurrentUser: (usr: User): void => localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(usr)),
  clearCurrentUser: (): void => localStorage.removeItem(DB_KEYS.CURRENT_USER),
  DB_KEYS,
};
