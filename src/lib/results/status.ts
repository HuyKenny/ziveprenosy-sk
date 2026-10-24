/** Match states stored by the results sync. The provider's own wording is kept in status_raw. */
export type Status =
  | 'scheduled' | 'live' | 'ht' | 'bt' | 'et' | 'pens'
  | 'ft' | 'aet' | 'pen'
  | 'postponed' | 'interrupted' | 'cancelled'
  | 'unknown' | 'unconfirmed';

export const FINAL: Status[] = ['ft', 'aet', 'pen'];
export const IN_PLAY: Status[] = ['live', 'ht', 'bt', 'et', 'pens'];

export const isFinal = (s: string) => (FINAL as string[]).includes(s);
export const isInPlay = (s: string) => (IN_PLAY as string[]).includes(s);

export type Group = 'live' | 'final' | 'upcoming' | 'other';
export function group(s: string): Group {
  if (isInPlay(s)) return 'live';
  if (isFinal(s)) return 'final';
  if (s === 'scheduled' || s === 'postponed') return 'upcoming';
  return 'other';
}

/** Slovak label; "Koniec" only for a confirmed final state. */
export function statusLabel(s: string, sport = 16): string {
  const hockey = sport === 23;
  switch (s) {
    case 'scheduled': return 'Nezačalo';
    case 'live': return 'Hrá sa';
    case 'ht': return sport === 16 || sport === 20 ? 'Polčas' : 'Prestávka';
    case 'bt': return 'Prestávka';
    case 'et': return 'Predĺženie';
    case 'pens': return hockey ? 'Nájazdy' : 'Penalty';
    case 'ft': return 'Koniec';
    case 'aet': return 'Koniec po predĺžení';
    case 'pen': return hockey ? 'Koniec po nájazdoch' : 'Koniec po penaltách';
    case 'postponed': return 'Odložené';
    case 'interrupted': return 'Prerušené';
    case 'cancelled': return 'Zrušené';
    case 'unconfirmed': return 'Výsledok nepotvrdený';
    default: return 'Neznámy stav';
  }
}

/** Short form for the narrow time column. */
export function statusShort(s: string, sport = 16): string {
  switch (s) {
    case 'live': return 'Naživo';
    case 'ht': return sport === 16 || sport === 20 ? 'Polčas' : 'Prest.';
    case 'bt': return 'Prest.';
    case 'et': return 'Predĺž.';
    case 'pens': return sport === 23 ? 'Nájazdy' : 'Penalty';
    case 'ft': return 'Koniec';
    case 'aet': return 'Po predĺž.';
    case 'pen': return sport === 23 ? 'Po SN' : 'Po pen.';
    case 'postponed': return 'Odlož.';
    case 'interrupted': return 'Preruš.';
    case 'cancelled': return 'Zruš.';
    case 'unconfirmed': return 'Nepotvrd.';
    default: return '?';
  }
}
