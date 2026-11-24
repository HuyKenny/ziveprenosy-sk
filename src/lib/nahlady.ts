import { getCollection, type CollectionEntry } from 'astro:content';

export type Preview = CollectionEntry<'nahlady'>;
export const previewPath = (p: Preview) => `/ako-pozerat/${p.id}/`;

/** All previews, nearest kick-off first; `upcoming` keeps those not older than 3 h after the start. */
export async function previews(opts: { upcoming?: boolean } = {}): Promise<Preview[]> {
  const all = await getCollection('nahlady');
  const cut = Date.now() - 3 * 3600_000;
  return all
    .filter((p) => !opts.upcoming || p.data.start.getTime() > cut)
    .sort((a, b) => (opts.upcoming ? a.data.start.getTime() - b.data.start.getTime() : b.data.start.getTime() - a.data.start.getTime()));
}

export async function previewFor(matchId: number): Promise<Preview | undefined> {
  return (await getCollection('nahlady')).find((p) => p.data.matchId === matchId);
}
