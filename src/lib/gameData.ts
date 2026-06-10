import { GameTheme, GameMode, DisciplineMode } from '../types';

export const GAME_THEMES: Record<string, GameTheme> = {
  'Grid Flash':      { slug: 'grid',     icon: '🌐', accent: '#00f0ff', accent2: '#0066ff' },
  'Number Sequence': { slug: 'sequence', icon: '🔢', accent: '#bd00ff', accent2: '#7b2fff' },
  'Card Match':      { slug: 'cards',    icon: '🃏', accent: '#39ff14', accent2: '#00cc66' },
  'Sequence Repeat': { slug: 'repeat',   icon: '🔁', accent: '#ffb800', accent2: '#ff8800' },
  'Speed Numbers':   { slug: 'speed',    icon: '⚡', accent: '#ff0055', accent2: '#ff4488' },
  'Numbers':         { slug: 'numbers',  icon: '🔢', accent: '#ff6b35', accent2: '#ff9500' },
  'Names & Faces':   { slug: 'faces',    icon: '👤', accent: '#ff66cc', accent2: '#cc44aa' },
  'Words':           { slug: 'words',    icon: '📝', accent: '#44ddbb', accent2: '#00aa88' },
  'Dates':           { slug: 'dates',    icon: '📅', accent: '#ffd700', accent2: '#cc9900' },
  'Cards':           { slug: 'playing',  icon: '🂡', accent: '#e63946', accent2: '#a00000' },
  'Cards Recall':    { slug: 'recall',   icon: '🎴', accent: '#6b5bff', accent2: '#4433cc' },
  'Images':          { slug: 'images',   icon: '🖼️', accent: '#aa66ff', accent2: '#7744cc' },
  'Binary':          { slug: 'binary',   icon: '💾', accent: '#aaff00', accent2: '#66cc00' },
  'Marathon':        { slug: 'marathon', icon: '🏁', accent: '#00f0ff', accent2: '#bd00ff' },
};

export const DISCIPLINE_MODES: DisciplineMode[] = [
  'Numbers', 'Names & Faces', 'Words', 'Dates', 'Cards', 'Cards Recall', 'Images', 'Binary'
];

export interface MarathonTask {
  type: 'discipline' | 'arcade';
  mode: GameMode;
}

export const MARATHON_TASKS: MarathonTask[] = [
  { type: 'discipline', mode: 'Numbers' },
  { type: 'discipline', mode: 'Binary' },
  { type: 'arcade',     mode: 'Grid Flash' },
  { type: 'discipline', mode: 'Words' },
  { type: 'arcade',     mode: 'Number Sequence' },
  { type: 'discipline', mode: 'Dates' },
  { type: 'discipline', mode: 'Names & Faces' },
  { type: 'arcade',     mode: 'Speed Numbers' },
  { type: 'discipline', mode: 'Cards' },
  { type: 'arcade',     mode: 'Sequence Repeat' },
  { type: 'discipline', mode: 'Images' },
  { type: 'arcade',     mode: 'Card Match' },
];

export const WORD_POOL = ['orbit','neuron','cipher','matrix','quantum','synapse','vector','nexus','prism','flux','pulse','vertex','axiom','helix','zenith','cortex','delta','sigma','photon','plasma'];
export const DATE_EVENTS = ['Moon Landing','Berlin Wall','Internet Born','DNA Discovered','Steam Engine','First Flight','Printing Press','Telephone','Penicillin','Relativity','Olympics 1896','Great Fire','Magna Carta','Apollo 11','Titanic Sinks'];
export const FACE_NAMES = ['Alex','Jordan','Sam','Riley','Casey','Morgan','Taylor','Quinn','Avery','Blake','Drew','Jamie','Kai','Logan','Noah','Parker'];
export const FACE_EMOJIS = ['👨','👩','🧑','👴','👵','🧔','👱','👳','🧕','👲','🤵','👰','🤴','👸','🦸','🦹'];
export const IMAGE_SYMBOLS = ['🔺','🔻','⭐','💠','🔶','🔷','⬛','⬜','🟥','🟦','🟩','🟨','🟪','🟧','⚫','⚪'];
export const CARD_SUITS = ['♠','♥','♦','♣'];
export const CARD_RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const CARD_EMOJIS = ['🚀','🛸','👾','🪐','🌀','🔋','🛡️','⚔️'];

export const LOG_MESSAGES = [
  { t: 0,    txt: '> INITIALIZING NEURAL SYNC MODULE...', type: 'info' },
  { t: 250,  txt: '> COGNITIVE CORE SCANNING... [OK]',    type: 'ok'   },
  { t: 550,  txt: '> CONFIGURING COGNITIVE FREQUENCY PATTERNS...', type: 'info' },
  { t: 850,  txt: '> SYNC RATE AT STABLE 120Hz LATENCY... [OK]',   type: 'ok'   },
  { t: 1150, txt: '> SECURE PROTOCOLS LOADED',             type: 'info' },
  { t: 1400, txt: '> CONNECTION COMPLETE. INITIATING CORE RUN.', type: 'ok' },
];

export const ARCADE_MODE_CONFIGS = [
  { mode: 'Grid Flash'      as GameMode, id: 'mode-grid',     icon: '🌐', label: 'Grid Flash',      title: 'GRID RECALL',      desc: 'Watch the flashing patterns, memorize their positions, then select them in any order.' },
  { mode: 'Number Sequence' as GameMode, id: 'mode-sequence', icon: '🔢', label: 'Number Sequence', title: 'NUMBER SEQUENCE',  desc: 'Tiles will reveal random ascending numbers. Memorize their positions and click in numeric order.' },
  { mode: 'Card Match'      as GameMode, id: 'mode-cards',    icon: '🃏', label: 'Card Match',      title: 'CARD MATCH',       desc: 'Cards will flip open briefly. Memorize the matching emoji pairs and match them up.' },
  { mode: 'Sequence Repeat' as GameMode, id: 'mode-repeat',   icon: '🔁', label: 'Sequence Repeat', title: 'SEQUENCE REPEAT',  desc: 'Watch the tiles flash one by one, then click them in the EXACT same sequence order.' },
  { mode: 'Speed Numbers'   as GameMode, id: 'mode-speed',    icon: '⚡', label: 'Speed Numbers',   title: 'SPEED NUMBERS',    desc: 'A long digit code will flash on screen. Memorize it, then enter it correctly to crack the sequence.' },
];

export function getModeSlug(mode: GameMode): string {
  return (GAME_THEMES[mode] || GAME_THEMES['Grid Flash']).slug;
}

export function getTheme(mode: GameMode): GameTheme {
  return GAME_THEMES[mode] || GAME_THEMES['Grid Flash'];
}
