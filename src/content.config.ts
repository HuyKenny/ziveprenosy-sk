import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Evergreen guides (/clanky/<slug>/): competitions, where and when to watch. Markdown in src/content/clanky. */
const clanky = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/clanky' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(), // rendered under the article + FAQPage JSON-LD
    related: z.array(z.string()).optional(), // slugs of related articles; falls back to the newest others
  }),
});
export const collections = { clanky };
