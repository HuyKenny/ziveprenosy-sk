# ziveprenosy.sk

Slovenský přehled živých sportovních přenosů a programu (sesterský web sportstreamy.cz), cíl = proklik na Tipsport.sk.
Záměrně jiný design, URL i texty než sportstreamy → žádný hreflang ani canonical mezi weby.

- **Stack:** Astro 7 SSR na Cloudflare Workers (`@astrojs/cloudflare`), vlastní entry `src/worker.ts` (Cache API + SWR). **Žádné crony.**
- **Data — vlastní Tipsport.sk Partner API (od 24. 11. 2026):** live job v Actions repa sportstreamy (`scripts/static/run.sh`) zavolá náš scheduled handler (`src/lib/tipsport.ts`: login `POST partners.tipsport.sk/rest/external/common/v2/session` → token + cookie JSESSIONID) → KV `sk:live` / `sk:pre`. Secrets `TIPSPORT_SK_USER/PASS/PRODUCT_ID` v repu sportstreamy, lokálně `credentials/.ziveprenosy-sk-credentials.env`.
  - Záloha: když SK snímek chybí nebo je starší než 2 h, `lib/matches.ts` vezme český feed sportstreamy (`live`, `pre`).
  - D1 `RESULTS` = `sportstreamy-results` — výsledky zapisuje sync sportstreamy.
  - **Změna schématu KV/D1 ve sportstreamy rozbije i tento web.**
  - SK feed má slovenské názvy; `src/lib/names.ts` (`skLeague`, `skTeam`, `skClock`) zůstává pro českou zálohu. `match` v `competitions.ts` bere obě varianty. Kurzy se **nezobrazují**. ID zápasů jsou na CZ i SK platformě stejná → výsledky z D1 sportstreamy sedí.
- **Klik:** `/go/tipsport/?m=<id>&p=<umístění>` → Tipsport TV odkaz, `/go/registracia/` → registrace (bonus 20 €). Odkazy ze spiny.sk (pid 12487, sid 17272) ve `wrangler.jsonc` → `vars`. Od 24. 11. `/go/tipsport/?m=<id>` vede přímo na zápas na tipsport.sk (cesta z `/_m/<shard>.json`, parametry pid/sid/bid/tid z TV odkazu); bez cesty TV odkaz. Analytics Engine `ziveprenosy_clicks`.
- **URL:** `/{sport}/`, `/{sport}/dnes/`, `/{sport}/{soutez}/`, `/prenos/{id}-{slug}/`, `/teraz-nazivo/`, `/program/[zajtra|YYYY-MM-DD]/`, `/vysledky/[vcera|YYYY-MM-DD]/`, `/tipsport-tv/`.
- **Soutěže:** `src/lib/competitions.ts` — `id` = klíč v D1 sportstreamy (neměnit), `slug` = naše URL, `sk: true` = slovenské (vždy navrchu).
- **Lokálně:** `pnpm build && pnpm exec wrangler dev --local --port 8816 --inspector-port 9316`. Lokální KV naplnit `wrangler kv key put --binding DATA --local pre --path pre.json` (data stáhnout přes CF API). Po buildu smazat `.wrangler/state/v3/cache` (jinak SWR servíruje staré HTML).
- **Assety:** `node scripts/assets.mjs` (OG, ikony), `python3 scripts/fonts.py` (subset Schibsted Grotesk), `scripts/shot.mjs` (screenshoty).
- **Nasazení:** `pnpm deploy` (CF creds z `~/ai/credentials/.cloudflare-credentials.env`).

## Statický web (Cloudflare Workers Free, připraveno 23. 11. 2026)
- Stránky renderuje a nasazuje live job v repu **HuyKenny/sportstreamy** (`.github/workflows/live.yml`, à 10 min): checkoutne toto repo, postaví ho, spustí lokálně se sdílenými daty a uloží stránky jako statické soubory; Worker je jen `src/edge.ts` (`/go/`, `/logo/`, varianty `?sport=`/`?stav=`, staré URL, 404). Push sem se nasadí při dalším běhu.
- Po přepnutí nikdy `pnpm deploy` (vrátí SSR Worker s KV/D1). `scripts/logos.mjs` čte týmy z `https://sportstreamy.cz/_data/team-logos.json`.
