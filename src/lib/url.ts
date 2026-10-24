import type { Match } from './types';
import { slugify } from './text';
import { SPORT_BY_ID } from './sports';
import { competitionSlug } from './competitions';
import { skTeam } from './names';

export const home = (m: Match) => skTeam(m.h);
export const away = (m: Match) => (m.a ? skTeam(m.a) : '');
export const matchTitle = (m: Match) => (m.a ? `${home(m)} – ${away(m)}` : home(m));
export const matchPath = (m: Match) => `/prenos/${m.id}-${slugify(m.a ? `${home(m)} ${away(m)}` : home(m))}/`;
export const sportPath = (slug: string) => `/${slug}/`;
export const sportTodayPath = (slug: string) => `/${slug}/dnes/`;
export const leaguePath = (sportSlug: string, sp: number, lg: string) => `/${sportSlug}/${competitionSlug(sp, lg)}/`;
export const leaguePathOf = (m: Match) => leaguePath(SPORT_BY_ID.get(m.sp)?.slug ?? 'sport', m.sp, m.lg);
export const sportOf = (m: Match) => SPORT_BY_ID.get(m.sp);
/** Tracked redirect to Tipsport.sk (TV link; registration link for the bonus). */
export const goPath = (m: Match | null, placement: string) => `/go/tipsport/?${m ? `m=${m.id}&` : ''}p=${placement}`;
export const regPath = (placement: string) => `/go/registracia/?p=${placement}`;
export const teamPath = (sportSlug: string, slug: string) => `/${sportSlug}/tim/${slug}/`;
