#!/usr/bin/env python3
"""Previews of big Slovak matches → src/content/nahlady/<slug>.md, then build check + commit + push (the live job in the
sportstreamy repo renders the site from this repo's HEAD every 10 minutes).

    python3 scripts/nahlady.py              # pick matches 10–60 h ahead, write up to MAX previews, push
    python3 scripts/nahlady.py --dry-run    # only print the candidates
    python3 scripts/nahlady.py --no-push    # write files, skip build/commit/push
    python3 scripts/nahlady.py --id 123     # force one match

The engine (OpenAI → claude -p fallback), schemas and the fact pipeline are shared with sportstreamy.cz
(apps/sportstreamy/scripts/nahledy.py); here only what is Slovak: which matches, prompts, validation, output.
Why: Ahrefs SK 24. 11. 2026 – "slovan bratislava – žilina" 19k, "slovan – stuttgart" 16k, "dac – podbrezová" 11k
searches a month at KD 0; competitors rank with one article per big match (reports/ziveprenosy/content-gap-2026-11-24.md).
TV stations are deliberately not named: there is no verified Slovak TV listing source.
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

APP = Path(__file__).resolve().parent.parent
OUT = APP / 'src' / 'content' / 'nahlady'
TZ = ZoneInfo('Europe/Bratislava')
MAX = int(os.environ.get('NAHLADY_MAX', '2'))

_spec = importlib.util.spec_from_file_location('cz', '/home/kenny/ai/apps/sportstreamy/scripts/nahledy.py')
cz = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(cz)
ask, slugify, yaml_str = cz.ask, cz.slugify, cz.yaml_str

FOOTBALL, HOCKEY = 16, 23
SK_CLUBS = re.compile(r'^(Slovan Bratislava|Trnava|Spartak Trnava|Žilina|Dunajská Streda|DAC Dunajská Streda|FC Košice|Košice|Podbrezová|'
                      r'Ružomberok|Michalovce|Trenčín|Skalica|Komárno|Banská Bystrica)$')
TOP_SK = re.compile(r'^(Slovan Bratislava|Trnava|Spartak Trnava|Žilina|Dunajská Streda|DAC Dunajská Streda)$')
HOCKEY_TOP = re.compile(r'^(Slovan Bratislava|Košice|Nitra|Zvolen|Banská Bystrica|Michalovce)$')
NHL_SK = re.compile(r'^(Montreal Canadiens|Calgary Flames|Tampa Bay Lightning|Washington Capitals|St\.Louis Blues)$')
BIG = re.compile(r'^(Real Madrid|FC Barcelona|Barcelona|Atlético Madrid|Bayern München|Dortmund|Paris SG|Manchester City|Manchester United|'
                 r'Liverpool|Arsenal|Chelsea|Tottenham|Inter Miláno|Inter Milano|AC Miláno|AC Milano|Juventus|Neapol|Napoli|Benfica Lisabon|Porto|Leverkusen)$')
EURO = {'Liga majstrov', 'Európska liga', 'Konferenčná liga'}
COMP_PATH = {'Liga majstrov': '/futbal/liga-majstrov/', 'Európska liga': '/futbal/europska-liga/', 'Konferenčná liga': '/futbal/konferencna-liga/',
             (FOOTBALL, '1. slovenská liga'): '/futbal/nike-liga/', 'Slovenská Tipsport liga': '/hokej/tipsport-liga/', 'NHL': '/hokej/nhl/'}
SPORT_SLUGS = {FOOTBALL: 'futbal', HOCKEY: 'hokej'}
TV = re.compile(r'\b(STVR|RTVS|Šport ?1|Šport ?2|JOJ|Dajto|Markíza|Voyo|Nova Sport|Arena Sport|Sport ?1|Sport ?2|DAZN|Eurosport|Canal\+|Premier Sport|Oneplay|Skylink|Magio|Niké TV|Huste)\b')
BANNED = re.compile(r'istá výhra|istota|tutovka|garantovan|zaručen|nemôžeš prehrať|našich dát|interných dát|naše dáta|\(Pozn', re.I)


def items():
    req = urllib.request.Request('https://ziveprenosy.sk/_data/nahledy.json', headers={'User-Agent': 'ziveprenosy-nahlady/1.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())['items']


def score(m):
    """Interest for Slovak searchers (0 = no preview)."""
    h, a, lg, sp = m['h'], m.get('a') or '', m['lg'], m['sp']
    if not a or re.search(r'U\d\d|žen|\(ž\)|ženy| Ž$|futsal|plážov|e-?šport|esport', lg + h + a, re.I):
        return 0
    if sp == FOOTBALL:
        if lg in EURO and (SK_CLUBS.match(h) or SK_CLUBS.match(a)):
            return 100
        if 'Slovensko' in (h, a):
            return 95
        if lg == '1. slovenská liga' and TOP_SK.match(h) and TOP_SK.match(a):
            return 90
        if lg == '1. slovenská liga' and (TOP_SK.match(h) or TOP_SK.match(a)):
            return 80
        if lg == '1. slovenská liga':
            return 65
        if lg in EURO and BIG.match(h) and BIG.match(a):
            return 70
    if sp == HOCKEY:
        if h == 'Slovensko' or a == 'Slovensko':
            return 95
        if lg == 'Slovenská Tipsport liga' and HOCKEY_TOP.match(h) and HOCKEY_TOP.match(a):
            return 80
        if lg == 'Slovenská Tipsport liga':
            return 62
        if lg == 'NHL' and (NHL_SK.match(h) or NHL_SK.match(a)):
            return 60
    return 0


def facts_for(m, comp_path):
    st = datetime.fromtimestamp(m['st'] / 1000, TZ)
    k = m.get('k')
    prob = None
    if k and k[0] and k[2]:
        inv = [1 / x if x else 0 for x in k]
        s = sum(inv)
        prob = [round(x / s * 100) for x in inv]
    return {
        'domaci': m['h'], 'hostia': m['a'], 'sutaz': m['lg'],
        'vykop': st.strftime('%-d. %-m. %Y o %H:%M') + ' (stredoeurópsky čas)',
        'den_v_tyzdni': ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota', 'nedeľa'][st.weekday()],
        'kurzy_1_X_2': k, 'pravdepodobnost_z_kurzov_percenta_1_X_2': prob,
        'video_prenos_po_prihlaseni': bool(m.get('stream')),
        'url_sutaze_na_webe': comp_path,
    }


RESEARCH_PROMPT = """Nájdi na webe aktuálne fakty k zápasu {home} – {away} ({league}, {kickoff}).
Hľadaj len: postavenie oboch tímov v tabuľke súťaže, výsledky ich posledných zápasov (aj v domácej lige), dôležité absencie (zranenia, tresty) a vzájomné zápasy.
Zdroje: oficiálne weby súťaží a klubov (nikeliga.sk, hockeyslovakia.sk, uefa.com, nhl.com, weby klubov), sportnet.sme.sk, sport.aktuality.sk, teraz.sk, flashscore.sk, livesport.cz, ESPN. Nie tipovacie a stávkové weby.
Pravidlá: každý fakt jedna slovenská veta s konkrétnym údajom, k nej plná URL zdroja a doslovná citácia zo zdroja (pôvodný jazyk), ktorá fakt dokladá. Len fakty k sezóne 2026/27 a k týmto tímom. Max 8 faktov. Keď nič spoľahlivé nenájdeš, vráť prázdny zoznam. Nič o TV vysielaní ani o kurzoch."""

CHECK_PROMPT = """Over fakty k zápasu {home} – {away} ({league}, {kickoff}). Pri každom fakte otvor jeho zdroj a porovnaj s citáciou.
- Zdroj fakt potvrdzuje → ponechaj bez zmeny.
- Zdroj ho vyvracia alebo hovorí inak (skóre, minúty, poradie, body, dátumy) → oprav text podľa zdroja.
- Nedá sa overiť, zdroj neexistuje, je o inej sezóne alebo inom zápase → fakt vyraď.
Vráť ponechané/opravené fakty a v „changes“ jednou vetou každú opravu či vyradenie.

FAKTY (JSON):
{facts}"""

WRITE_PROMPT = """Si športový redaktor slovenského webu ŽivéPrenosy.sk (prehľad živých prenosov). Napíš náhľad zápasu {home} – {away} pre čitateľov, ktorí hľadajú „{home} {away} online / kde pozerať / naživo“.

POUŽI VÝHRADNE TIETO FAKTY (nič iné nevieš; žiadne iné mená, čísla, výsledky ani televízne stanice):
Údaje o zápase: {data}
Online: {stream_line}
Overené fakty o forme a kontexte: {facts}

ŠTÝL: športový novinár, prirodzená spisovná slovenčina v celých vetách, tykanie. Žiadne odrážky typu „Zápas: … Výkop: …“, žiadne poznámky v zátvorkách, žiadne zmienky o dátach, zdrojoch ani overovaní, nič neopakuj. Žiadne tipy na výsledok. Kurzy len opíš (favorit, pravdepodobnosť z údajov) a povedz, že ide o stav v čase písania a aktuálne kurzy sú na stránke. Televízne stanice NEUVÁDZAJ vôbec (nemáme overené, kto zápas vysiela) – pri sledovaní píš len o online prenose a živých štatistikách. Keď je overených faktov málo, sekciu o forme napíš krátko a všeobecne – nevymýšľaj. Drž chronológiu podľa dátumov vo faktoch.

VÝSTUP (JSON):
- title: „{home} – {away}: kde pozerať naživo a kurzy“ (max 70 znakov).
- description: 140–160 znakov, obe mená, dátum a „kde pozerať“.
- body: Markdown, 300–500 slov, bez H1, sekcie ## „Kedy a kde sa hrá“, „Kde pozerať {home} – {away} online“, „Forma a kontext“, „Čo hovoria kurzy“. V sekcii o sledovaní presne tento odkaz: [detail zápasu so živým skóre]({match_url}). Iné odkazy len tieto: {our_links}. Posledná veta: 18+ a zodpovedné hranie.
- faq: 3 otázky a odpovede (kedy sa hrá, kde pozerať, kto je favorit podľa kurzov), 1–2 vety, bez odkazov.
Názvy klubov skloňuj správne po slovensky (proti Slovanu, so Žilinou, v Trnave)."""


def tidy(p, m):
    h, a = m['h'], m['a']
    if len(p['title']) > 80:
        p['title'] = next(t for t in (f'{h} – {a}: kde pozerať naživo a kurzy', f'{h} – {a}: kde pozerať naživo', f'{h} – {a}') if len(t) <= 80 or t == f'{h} – {a}')
    if not 120 <= len(p['description']) <= 170:
        st = datetime.fromtimestamp(m['st'] / 1000, TZ)
        day = ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota', 'nedeľa'][st.weekday()]
        d = f'Kde pozerať {h} – {a} ({m["lg"]}), {day} {st.day}. {st.month}. o {st:%H:%M}: prenos online, živé skóre, kurzy a forma oboch tímov.'
        if len(d) > 170:
            d = d.replace(' a forma oboch tímov', '').replace(f' ({m["lg"]})', '')
        if len(d) < 120:
            d += ' Prehľad pred zápasom.'
        p['description'] = d[:170]
    fix = lambda t: re.sub(r'\b([Nn])aše dáta\b', lambda x: ('D' if x.group(1) == 'N' else 'd') + 'ostupné údaje', t)
    p['body'] = fix(p['body'])
    p['faq'] = [{'q': q['q'], 'a': fix(q['a'])} for q in p['faq']]
    return p


def validate(p, m):
    errs = []
    words = len(re.sub(r'[#*\[\]()]', ' ', p['body']).split())
    if not 250 <= words <= 800:
        errs.append(f'dĺžka {words} slov')
    for team in (m['h'], m['a']):
        if team.split(' ')[0].lower()[:5] not in (p['title'] + p['body']).lower():
            errs.append(f'chýba tím {team}')
    if len(p['title']) > 80 or not 120 <= len(p['description']) <= 170:
        errs.append('dĺžka title/description')
    text = p['body'] + ' ' + p['description'] + ' ' + ' '.join(q['a'] for q in p['faq'])
    tv = TV.findall(text)
    if tv:
        errs.append(f'TV stanica v texte {sorted(set(tv))}')
    bad = BANNED.search(text)
    if bad:
        errs.append(f'zakázaná fráza „{bad.group(0)}“')
    links = re.findall(r'\]\((https?://[^)]+|/[^)]*)\)', p['body'])
    ext = [l for l in links if l.startswith('http') and 'ziveprenosy.sk' not in l]
    if ext:
        errs.append(f'cudzie odkazy {ext[:2]}')
    if '18' not in p['body'].strip().split('\n')[-1]:
        errs.append('chýba záverečná veta 18+')
    if '/prenos/' not in p['body']:
        errs.append('chýba odkaz na detail zápasu')
    if len(p['faq']) < 2:
        errs.append('málo FAQ')
    return errs


def preview(m, comp, match_url):
    log = []
    kickoff = datetime.fromtimestamp(m['st'] / 1000, TZ).strftime('%-d. %-m. %Y %H:%M')
    found, _ = ask(RESEARCH_PROMPT.format(home=m['h'], away=m['a'], league=m['lg'], kickoff=kickoff), cz.FACTS_SCHEMA, cz.MODEL, 'medium')
    facts = [f for f in found['facts'] if f['source'] and f['quote'].strip()]
    checked, _ = ask(CHECK_PROMPT.format(home=m['h'], away=m['a'], league=m['lg'], kickoff=kickoff, facts=json.dumps(facts, ensure_ascii=False, indent=1)),
                     cz.CHECKED_SCHEMA, cz.CHECK_MODEL, 'medium') if facts else ({'facts': [], 'changes': []}, 0.0)
    checked['facts'] = [f for f in checked['facts'] if f['source']]
    log.append(f'fakty: nájdené {len(facts)}, po kontrole {len(checked["facts"])}')
    stream_line = ('K zápasu je video prenos pre registrovaných a prihlásených používateľov u prevádzkovateľa (tlačidlo Pozerať na našej stránke).' if m.get('stream') else
                   'K zápasu nie je video prenos u prevádzkovateľa, sú k dispozícii živé štatistiky a priebežné skóre.')
    prompt = WRITE_PROMPT.format(home=m['h'], away=m['a'], data=json.dumps(facts_for(m, comp), ensure_ascii=False), stream_line=stream_line,
                                 facts=json.dumps([f['text'] for f in checked['facts']], ensure_ascii=False) if checked['facts'] else '(žiadne – sekciu o forme napíš všeobecne)',
                                 match_url=match_url, our_links=f'{comp}, /tipsport-tv/, /kurzy-dnes/, /teraz-nazivo/')
    for _ in range(2):
        p, _ = ask(prompt, cz.WRITE_SCHEMA, cz.WRITE_MODEL, 'low', web=False)
        p = tidy(p, m)
        p['sources'] = list(dict.fromkeys(f['source'] for f in checked['facts']))
        errs = validate(p, m)
        if not errs:
            break
        log.append(f'prepis po validácii: {"; ".join(errs)}')
        prompt += '\n\nPREDCHÁDZAJÚCA VERZIA BOLA ODMIETNUTÁ, oprav: ' + '; '.join(errs)
    return p, log


def write(slug, m, p, sport_slug):
    st = datetime.fromtimestamp(m['st'] / 1000, timezone.utc).isoformat().replace('+00:00', 'Z')
    fm = ['---', f"title: {yaml_str(p['title'])}", f"description: {yaml_str(p['description'])}", f"matchId: {m['id']}",
          f"home: {yaml_str(m['h'])}", f"away: {yaml_str(m['a'])}", f"league: {yaml_str(m['lg'])}", f"sport: {sport_slug}", f'start: {st}',
          'sources: ' + json.dumps([u for u in p['sources'] if u.startswith('http')][:8], ensure_ascii=False), 'faq:']
    for q in p['faq'][:4]:
        fm += [f"  - q: {yaml_str(q['q'])}", f"    a: {yaml_str(q['a'])}"]
    fm += [f"date: {datetime.now(TZ).date().isoformat()}", '---', '']
    (OUT / f'{slug}.md').write_text('\n'.join(fm) + p['body'].strip() + '\n', encoding='utf-8')


def existing_ids():
    ids = set()
    for f in OUT.glob('*.md'):
        x = re.search(r'^matchId:\s*(\d+)', f.read_text(encoding='utf-8'), re.M)
        if x:
            ids.add(int(x.group(1)))
    return ids


def sh(cmd):
    return subprocess.run(cmd, cwd=APP, check=True, capture_output=True, text=True)


def main():
    force = [int(sys.argv[i + 1]) for i, a in enumerate(sys.argv) if a == '--id']
    now = time.time() * 1000
    have = existing_ids()
    cands = []
    for m in items():
        if m['id'] in have:
            continue
        if force:
            if m['id'] in force:
                cands.append((999, m))
            continue
        s = score(m)
        if s >= 60 and now + 10 * 3600_000 <= m['st'] <= now + 60 * 3600_000:
            cands.append((s, m))
    cands.sort(key=lambda x: (-x[0], x[1]['st']))
    cands = cands[:MAX]
    for s, m in cands:
        print(f"{s:3} {datetime.fromtimestamp(m['st'] / 1000, TZ):%d.%m %H:%M} {m['lg']} | {m['h']} – {m['a']}")
    if '--dry-run' in sys.argv or not cands:
        return
    OUT.mkdir(parents=True, exist_ok=True)
    made = []
    for s, m in cands:
        sport_slug = SPORT_SLUGS.get(m['sp'], 'futbal')
        comp = COMP_PATH.get((m['sp'], m['lg'])) or COMP_PATH.get(m['lg']) or f'/{sport_slug}/'
        slug = f"{slugify(m['h'])}-{slugify(m['a'])}-{datetime.fromtimestamp(m['st'] / 1000, TZ):%Y-%m-%d}"
        match_url = f"/prenos/{m['id']}-{slugify(m['h'] + ' ' + m['a'])}/"
        try:
            p, log = preview(m, comp, match_url)
            for line in log:
                print(f'  {slug}: {line}')
            errs = validate(p, m)
            if errs:
                print(f"ZAMIETNUTÉ {slug}: {'; '.join(errs)}", file=sys.stderr)
                continue
            write(slug, m, p, sport_slug)
            made.append(slug)
            print(f'OK {slug}')
        except Exception as e:
            print(f'CHYBA {slug}: {e}', file=sys.stderr)
    print(f'nových {len(made)}')
    if not made or '--no-push' in sys.argv:
        return
    try:
        sh(['pnpm', 'build'])  # a broken preview must never reach the live job (it builds this repo for both sites)
    except subprocess.CalledProcessError as e:
        for s in made:
            (OUT / f'{s}.md').unlink(missing_ok=True)
        raise SystemExit(f'build zlyhal, náhľady zmazané: {e.stderr[-300:]}')
    sh(['git', 'add', 'src/content/nahlady'])
    sh(['git', '-c', 'user.name=Kenny', '-c', 'user.email=kenny@localhost', 'commit', '-qm', f"Match previews: {', '.join(made)}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"])
    subprocess.run(['git', 'push', '-q', 'origin', 'main'], cwd=APP, check=False)


if __name__ == '__main__':
    main()
