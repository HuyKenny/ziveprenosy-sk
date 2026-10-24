/** Shapes of the match details sportstreamy's sync stores in D1 (`matches.stats`, `matches.h2h`). Read only here. */
export interface Detail {
  /** For 'sub': player = going off, assist = coming on. */
  events: { min: string; side: 'h' | 'a'; kind: 'goal' | 'own' | 'pen' | 'missed' | 'red' | 'yellowred' | 'yellow' | 'sub' | 'var' | 'pim'; player: string; assist: string | null; note?: string }[];
  stats: { key: string; h: string | null; a: string | null }[];
  lineups: { side: 'h' | 'a'; formation: string | null; coach: string | null; xi: string[] }[];
  at: number;
}

export interface Meeting { date: number; home: string; away: string; sh: number; sa: number; league: string }
