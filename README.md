# ziveprenosy.sk

Slovenský přehled živých sportovních přenosů a programu (sesterský web sportstreamy.cz), cíl = proklik na Tipsport.sk.
Záměrně jiný design, URL i texty než sportstreamy → žádný hreflang ani canonical mezi weby.

- **Stack:** Astro 7 SSR na Cloudflare Workers (`@astrojs/cloudflare`), vlastní entry `src/worker.ts` (Cache API + SWR). **Žádné crony.**
- **Data — sdílená se sportstreamy, jen čtení:**
  - KV `DATA` = namespace `sportstreamy-data` (`live`, `pre`) — plní cron sportstreamy (Tipsport CZ API). Tipsport povolil jednu sadu volání → tento web Tipsport nevolá.
  - D1 `RESULTS` = `sportstreamy-results` — výsledky zapisuje sync sportstreamy.
  - **Změna schématu KV/D1 ve sportstreamy rozbije i tento web.**
  - Názvy z feedu jsou česky → `src/lib/names.ts` (`skLeague`, `skTeam`, `skClock`). Kurzy z feedu (CZ) se **nezobrazují**.
- **Klik:** `/go/tipsport/?m=<id>&p=<umístění>` → Tipsport TV odkaz, `/go/registracia/` → registrace (bonus 20 €). Odkazy ze spiny.sk (pid 12487, sid 17272) ve `wrangler.jsonc` → `vars`, dokud Tipsport SK neschválí vlastní účet. Bez deeplinku na zápas (cesty ve feedu jsou z tipsport.cz). Analytics Engine `ziveprenosy_clicks`.
- **URL:** `/{sport}/`, `/{sport}/dnes/`, `/{sport}/{soutez}/`, `/prenos/{id}-{slug}/`, `/teraz-nazivo/`, `/program/[zajtra|YYYY-MM-DD]/`, `/vysledky/[vcera|YYYY-MM-DD]/`, `/tipsport-tv/`.
- **Soutěže:** `src/lib/competitions.ts` — `id` = klíč v D1 sportstreamy (neměnit), `slug` = naše URL, `sk: true` = slovenské (vždy navrchu).
- **Lokálně:** `pnpm build && pnpm exec wrangler dev --local --port 8816 --inspector-port 9316`. Lokální KV naplnit `wrangler kv key put --binding DATA --local pre --path pre.json` (data stáhnout přes CF API). Po buildu smazat `.wrangler/state/v3/cache` (jinak SWR servíruje staré HTML).
- **Assety:** `node scripts/assets.mjs` (OG, ikony), `python3 scripts/fonts.py` (subset Schibsted Grotesk), `scripts/shot.mjs` (screenshoty).
- **Nasazení:** `pnpm deploy` (CF creds z `~/ai/credentials/.cloudflare-credentials.env`).
