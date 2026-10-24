import { COMPETITIONS } from '../competitions';
import { SPORT_BY_ID } from '../sports';

/** Copy for the per-sport results pages; a sport appears only when results are synced for one of its competitions. */
const TEXT: Record<number, { lead: string; titleComps: string }> = {
  16: { lead: 'Výsledky futbalových zápasov: Niké liga, 2. liga, európske poháre a top ligy so strelcami gólov.', titleComps: 'Niké liga, Liga majstrov, Premier League' },
  23: { lead: 'Hokejové výsledky: Tipsport liga, 1. liga, NHL a česká extraliga, skóre po tretinách.', titleComps: 'Tipsport liga, NHL, česká extraliga' },
  7: { lead: 'Basketbalové výsledky: NBA a Euroliga, skóre po štvrtinách.', titleComps: 'NBA, Euroliga' },
  47: { lead: 'Volejbalové výsledky slovenskej extraligy so stavom setov.', titleComps: 'extraliga' },
  20: { lead: 'Výsledky slovenskej hádzanárskej extraligy.', titleComps: 'extraliga' },
};

export interface ResultSport { id: number; slug: string; name: string; comps: string[]; lead: string; titleComps: string }

export function resultSports(comps: string[]): ResultSport[] {
  const out: ResultSport[] = [];
  for (const id of [16, 23, 7, 47, 20]) {
    const mine = COMPETITIONS.filter((c) => c.sp === id && comps.includes(c.id)).map((c) => c.id);
    const s = SPORT_BY_ID.get(id);
    if (s && mine.length) out.push({ id, slug: s.slug, name: s.name, comps: mine, ...TEXT[id] });
  }
  return out;
}
