import data from '../data/photos.json';
import articleData from '../data/article-photos.json';

export interface Photo { slug: string; author: string; authorUrl: string; url: string; alt: string }

const PHOTOS = data as Record<string, Omit<Photo, 'slug'>>;
/** Sports without their own shot borrow the closest one. */
const FALLBACK: Record<string, string> = { 'americky-futbal': 'stadion', baseball: 'stadion', rugby: 'stadion', kriket: 'stadion', bedminton: 'tenis', sach: 'esporty', lyzovanie: 'stadion' };

/** `seed` (e.g. a match id) picks the alternate "-2" shot for odd values, so neighbouring cards differ. */
export function photoFor(slug?: string, seed = 0): Photo {
  const s = slug && PHOTOS[slug] ? slug : (slug && FALLBACK[slug]) || 'stadion';
  const alt = `${s}-2`;
  const pick = seed % 2 === 1 && PHOTOS[alt] ? alt : s;
  return { slug: pick, ...PHOTOS[pick] };
}
/** Alternate shots exist only up to 800 px (they are used in cards). */
export const hasLarge = (slug: string) => !slug.endsWith('-2');
export const allPhotos = (): Photo[] => Object.entries(PHOTOS).map(([slug, p]) => ({ slug, ...p }));
/** Feature photos of the articles in /clanky/ (for the photo credits page). */
export const articlePhotos = (): Photo[] => Object.entries(articleData as Record<string, Omit<Photo, 'slug'>>).map(([slug, p]) => ({ slug, ...p }));
