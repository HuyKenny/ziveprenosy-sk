import { slugify } from './text';
import { skLeague } from './names';

/**
 * Curated competitions: stable landing pages (they exist even when nothing is scheduled) and a whitelist that keeps
 * their matches on the site although Tipsport has no video for them. `match` is tested against Tipsport's
 * (Czech) competition name. `id` is the key the shared results database uses — keep it as sportstreamy.cz has it;
 * `slug` is our own URL.
 */
export interface Competition {
  id: string;
  slug: string;
  name: string;
  sp: number; // idSuperSport
  match: RegExp;
  short: string; // badge text
  color: string; // badge background
  intro: string;
  top?: boolean; // in "Populárne súťaže"
  sk?: boolean; // Slovak competition: first on the homepage
  /** Search-led title and extra FAQ (Marketing Miner sk, 24. 10. 2026). */
  seo?: { title: string; faq?: { q: string; a: string }[] };
  /** Longer evergreen copy (HTML) under the lists: what the competition is, when it is played, where to watch. */
  body?: string;
  /** H1 when it should differ from "<name> online" (e.g. the name people search for). */
  h1?: string;
}

export const COMPETITIONS: Competition[] = [
  { id: 'nike-liga', slug: 'nike-liga', name: 'Niké liga', sp: 16, match: /^1\. slovenská liga$/, short: 'NL', color: '#0b4ea2', top: true, sk: true,
    seo: { title: 'Niké liga – zápasy dnes, výsledky a program', faq: [{ q: 'Kedy sa hrá Niké liga?', a: "Kolá Niké ligy sa hrajú najmä v sobotu a v nedeľu popoludní a večer. Presné časy zápasov aktuálneho kola sú v programe na tejto stránke." }, { q: 'Kde nájdem výsledky Niké ligy?', a: "Na stránke Niké liga výsledky – zápasy za posledný týždeň aj so strelcami gólov." }] },
    body: "<h2>Niké liga – program, zápasy a výsledky</h2><p>Niké liga je najvyššia slovenská futbalová súťaž. Na tejto stránke nájdeš všetky zápasy aktuálneho kola s časom výkopu, zápasy, ktoré práve bežia, aj s priebežným skóre, a posledné výsledky so strelcami gólov. Program sa aktualizuje priebežne, takže po zmene termínu zápasu sa zmení aj tu.</p><h3>Kedy sa hrá a kde pozerať</h3><p>Kolá sa hrajú hlavne cez víkend, keď slovenské kluby hrajú európske poháre, posúvajú sa ich ligové zápasy na iné dni. Pri každom zápase vidíš, či je k dispozícii video, alebo len živé štatistiky. Televízne práva na Niké ligu má domáca televízia, preto pri časti zápasov ponúkame živé skóre a štatistiky.</p><h3>Kluby a výsledky</h3><p>Každý klub Niké ligy má vlastnú stránku s programom, formou a poslednými výsledkami – odkazy nájdeš v bloku Kluby. Kompletné výsledky za posledný týždeň sú na stránke <a href=\"/futbal/nike-liga/vysledky/\">Niké liga výsledky</a>.</p>",
    intro: 'Niké liga je najvyššia slovenská futbalová súťaž. Kolá sa hrajú hlavne cez víkend, v sobotu a v nedeľu popoludní a večer, pri európskych pohároch aj v iné dni. Pri každom zápase nájdeš čas výkopu a odkaz na prenos alebo živé štatistiky.' },
  { id: '2-slovenska-liga', slug: '2-liga', name: '2. liga', sp: 16, match: /^2\. slovenská liga$/, short: '2L', color: '#3a6fb8', sk: true,
    intro: 'Druhá najvyššia slovenská futbalová súťaž. Zápasy sa hrajú najmä v sobotu a v nedeľu, niektoré kolá aj v strede týždňa.' },
  { id: 'slovenska-extraliga', slug: 'tipsport-liga', name: 'Tipsport liga', sp: 23, match: /^Slovenská Tipsport liga$/, short: 'TL', color: '#c8102e', top: true, sk: true,
    h1: 'Hokej extraliga (Tipsport liga) online',
    seo: { title: 'Hokej extraliga (Tipsport liga) – zápasy dnes a výsledky', faq: [{ q: 'Je Tipsport liga to isté čo hokejová extraliga?', a: "Áno. Tipsport liga je súčasný názov najvyššej slovenskej hokejovej súťaže, ľudovo extraligy." }, { q: 'Kde nájdem výsledky Tipsport ligy?', a: "Na stránke Tipsport liga výsledky – zápasy za posledný týždeň aj so skóre po tretinách." }] },
    body: "<h2>Hokej extraliga – zápasy dnes, program a výsledky</h2><p>Tipsport liga je súčasný názov najvyššej slovenskej hokejovej súťaže, ktorú väčšina fanúšikov volá jednoducho hokejová extraliga. Na tejto stránke nájdeš zápasy, ktoré sa hrajú dnes, program na ďalšie dni, zápasy naživo s priebežným skóre a výsledky odohraných kôl.</p><h3>Kedy sa hrá extraliga</h3><p>Extraliga sa hrá viackrát do týždňa, najviac zápasov býva v piatok a v nedeľu. Presný čas každého zápasu je v programe vyššie a ak sa termín zmení, uvidíš to aj tu.</p><h3>Kde pozerať hokej extraligy online</h3><p>Pri každom zápase je tlačidlo na prenos alebo živé štatistiky. Zápasy s videom pozerajú registrovaní hráči zadarmo, k ostatným ponúkame priebežné skóre a štatistiky. Program a výsledky jednotlivých klubov – od HC Slovan Bratislava cez HK Nitra po HC Košice – nájdeš na ich stránkach v bloku Kluby a výsledky celej súťaže na stránke <a href=\"/hokej/tipsport-liga/vysledky/\">extraliga výsledky</a>.</p>",
    intro: 'Tipsport liga je najvyššia slovenská hokejová súťaž. Hrá sa viackrát do týždňa, najviac zápasov býva v piatok a v nedeľu. Program kola, živé skóre a odkaz na zápas nájdeš tu.' },
  { id: 'slovenska-1-liga-hokej', slug: '1-liga', name: '1. hokejová liga', sp: 23, match: /^Slovensk\S* 1\. ?liga/, short: '1L', color: '#e0606f', sk: true,
    intro: 'Druhá najvyššia slovenská hokejová súťaž. Program, živé skóre a výsledky zápasov nájdeš tu.' },
  { id: 'slovenska-extraliga-volejbal', slug: 'extraliga', name: 'Extraliga volejbalu', sp: 47, match: /^Slovensk\S* (extra)?liga(?!.*(Ž|žen))/, short: 'EV', color: '#0b4ea2', sk: true,
    intro: 'Najvyššia slovenská volejbalová súťaž mužov. Pri zápasoch nájdeš čas, priebežný stav setov a výsledky.' },
  { id: 'slovenska-extraliga-hazena', slug: 'extraliga', name: 'Extraliga hádzanej', sp: 20, match: /^Slovensk\S* .*extraliga(?!.*(Ž|žen))/, short: 'EH', color: '#0b4ea2', sk: true,
    intro: 'Najvyššia slovenská hádzanárska súťaž mužov. Program zápasov, živé skóre a výsledky.' },
  { id: 'liga-mistru', slug: 'liga-majstrov', name: 'Liga majstrov', sp: 16, match: /^Liga mistrů$/, short: 'LM', color: '#1b2a6b', top: true,
    seo: { title: 'Liga majstrov – zápasy dnes, výsledky a program', faq: [{ q: 'Kedy sa hrá Liga majstrov?', a: "Ligová fáza Ligy majstrov sa hrá v utorok a v stredu, výkopy sú o 18:45 a o 21:00 nášho času." }, { q: 'Kde nájdem výsledky Ligy majstrov?', a: "Na stránke Liga majstrov výsledky – všetky zápasy za posledný týždeň so strelcami." }] },
    body: "<h2>Liga majstrov – zápasy, program a výsledky</h2><p>Liga majstrov UEFA je najprestížnejšia klubová futbalová súťaž v Európe. Na tejto stránke nájdeš zápasy, ktoré sa hrajú dnes, program ďalších kôl, zápasy naživo s priebežným skóre a výsledky so strelcami gólov.</p><h3>Kedy sa hrá Liga majstrov</h3><p>Zápasy sa hrajú v utorok a v stredu večer, výkopy sú o 18:45 a o 21:00 nášho času. V rozhodujúcich fázach súťaže sa program mení podľa žrebu, aktuálne termíny sú vždy v programe vyššie.</p><h3>Kde sledovať Ligu majstrov</h3><p>Televízne práva na Ligu majstrov má televízia, pri zápasoch preto nájdeš priebežné skóre a živé štatistiky. Výsledky za posledný týždeň sú prehľadne na stránke <a href=\"/futbal/liga-majstrov/vysledky/\">Liga majstrov výsledky</a>.</p>",
    intro: 'Liga majstrov UEFA je najprestížnejšia klubová súťaž Európy. Zápasy ligovej fázy sa hrajú v utorok a v stredu, výkopy sú o 18:45 a o 21:00.' },
  { id: 'evropska-liga', slug: 'europska-liga', name: 'Európska liga', sp: 16, match: /^Evropská liga$/, short: 'EL', color: '#b25a00', top: true,
    intro: 'Európska liga UEFA sa hrá vo štvrtok v dvoch blokoch, o 18:45 a o 21:00.' },
  { id: 'konferencni-liga', slug: 'konferencna-liga', name: 'Konferenčná liga', sp: 16, match: /^Konferenční liga$/, short: 'KL', color: '#1f7a6d', top: true,
    body: "<h2>Konferenčná liga – zápasy, program a výsledky</h2><p>Konferenčná liga UEFA je tretí európsky klubový pohár a slovenské kluby v nej patria medzi pravidelných účastníkov. Na tejto stránke nájdeš program zápasov, zápasy naživo a výsledky so strelcami.</p><p>Zápasy sa hrajú vo štvrtok vo dvoch blokoch, o 18:45 a o 21:00. Výsledky za posledný týždeň sú na stránke <a href=\"/futbal/konferencna-liga/vysledky/\">Konferenčná liga výsledky</a>.</p>",
    intro: 'Konferenčná liga UEFA je tretí európsky pohár. Hrá sa vo štvrtok a slovenské kluby v nej patria medzi pravidelných účastníkov.' },
  { id: 'premier-league', slug: 'premier-league', name: 'Premier League', sp: 16, match: /^1\. anglická liga$/, short: 'PL', color: '#3d0e4f', top: true,
    intro: 'Premier League je najsledovanejšia futbalová liga sveta. Väčšina kola sa hrá v sobotu popoludní, šlágre v nedeľu a vybrané zápasy v pondelok večer.' },
  { id: 'la-liga', slug: 'la-liga', name: 'La Liga', sp: 16, match: /^1\. španělská liga$/, short: 'LL', color: '#8a1c1c', top: true,
    intro: 'Španielska La Liga – Real Madrid, Barcelona, Atlético. Večerné zápasy sa začínajú často až o 21:00 nášho času.' },
  { id: 'bundesliga', slug: 'bundesliga', name: 'Bundesliga', sp: 16, match: /^1\. německá liga$/, short: 'BL', color: '#a3141b', top: true,
    intro: 'Nemecká Bundesliga sa hrá najmä v sobotu o 15:30, šlágre kola sa začínajú o 18:30.' },
  { id: 'serie-a', slug: 'serie-a', name: 'Serie A', sp: 16, match: /^1\. italská liga$/, short: 'SA', color: '#0b4f8a', top: true,
    intro: 'Talianska Serie A má zápasy rozložené od piatka do pondelka, večerné stretnutia sa začínajú o 20:45. Pravidelne v nej hrajú aj slovenskí reprezentanti.' },
  { id: 'ligue-1', slug: 'ligue-1', name: 'Ligue 1', sp: 16, match: /^1\. francouzská liga$/, short: 'L1', color: '#24335c',
    intro: 'Francúzska Ligue 1 – PSG, Marseille, Lyon. Hlavné zápasy kola sú v nedeľu večer.' },
  { id: 'championship', slug: 'championship', name: 'Championship', sp: 16, match: /^2\. anglická liga$/, short: 'EFL', color: '#3a3f73',
    intro: 'Championship je druhá anglická liga s 24 tímami a nabitým programom vrátane stredajších kôl.' },
  { id: 'chance-liga', slug: 'chance-liga', name: 'Chance Liga (CZ)', sp: 16, match: /^Česká Chance Liga$/, short: 'CZ', color: '#1f6f43',
    intro: 'Česká Chance Liga – Slavia, Sparta, Plzeň a ďalšie kluby, v ktorých pôsobí aj množstvo Slovákov. Hrá sa od piatka do pondelka.' },
  { id: 'nhl', slug: 'nhl', name: 'NHL', sp: 23, match: /^NHL$/, short: 'NHL', color: '#111111', top: true,
    seo: { title: 'NHL dnes – zápasy, výsledky a program', faq: [{ q: 'Kedy sa hrajú zápasy NHL?', a: "Väčšina zápasov NHL sa u nás začína medzi polnocou a druhou hodinou ráno, víkendové zápasy aj popoludní a večer. Časy sú prepočítané na slovenský čas." }, { q: 'Kde nájdem výsledky NHL?', a: "Na stránke NHL výsledky – zápasy za posledný týždeň, skóre po tretinách a strelci." }, { q: 'Hrajú v NHL Slováci?', a: "Áno, v NHL pravidelne hrajú slovenskí hokejisti. Ich zápasy nájdeš v programe NHL na tejto stránke." }] },
    body: "<h2>NHL dnes – zápasy, program a výsledky</h2><p>NHL je najlepšia hokejová liga sveta. Na tejto stránke nájdeš zápasy, ktoré sa hrajú dnes v noci, program na ďalšie dni, zápasy naživo s priebežným skóre a výsledky so skóre po tretinách. Všetky časy sú prepočítané na slovenský čas.</p><h3>Kedy sa hrá NHL</h3><p>Väčšina zápasov sa u nás začína po polnoci, víkendové zápasy aj popoludní a večer. Ráno tak nájdeš výsledky nočných zápasov na stránke <a href=\"/hokej/nhl/vysledky/\">NHL výsledky</a>.</p><h3>Slováci v NHL</h3><p>V NHL pravidelne hrajú slovenskí hokejisti a ich zápasy sú medzi fanúšikmi na Slovensku najsledovanejšie. Nájdeš ich v programe NHL, pri každom zápase s časom začiatku a priebežným skóre.</p>",
    intro: 'NHL je najlepšia hokejová liga sveta a hrajú v nej aj slovenskí hokejisti. Zápasy sa u nás začínajú väčšinou medzi polnocou a druhou hodinou ráno, víkendové zápasy aj popoludní a večer.' },
  { id: 'tipsport-extraliga', slug: 'ceska-extraliga', name: 'Česká extraliga', sp: 23, match: /^Česká Tipsport extraliga$/, short: 'CZ', color: '#0f3d7a',
    intro: 'Najvyššia česká hokejová súťaž, v ktorej hrá veľa slovenských hráčov. Hrá sa v utorok, piatok a v nedeľu, najčastejšie od 17:30 a 18:00.' },
  { id: 'ms-v-hokeji', slug: 'ms-v-hokeji', name: 'MS v hokeji', sp: 23, match: /^(MS 20\d\d|Mistrovství světa)(?!.*U\d\d)/, short: 'MS', color: '#b3122e', top: true,
    intro: 'Majstrovstvá sveta v ľadovom hokeji sa hrajú každý rok v máji. Ročník 2027 hostí Nemecko. Keď budú zápasy v ponuke, nájdeš tu celý program s časmi a odkazom na prenos.' },
  { id: 'nba', slug: 'nba', name: 'NBA', sp: 7, match: /^NBA$/, short: 'NBA', color: '#17408b', top: true,
    intro: 'NBA sa pre časový posun hrá v noci nášho času. Program na ďalší deň nájdeš už večer vopred.' },
  { id: 'euroliga', slug: 'euroliga', name: 'Euroliga', sp: 7, match: /^Euroliga$/, short: 'EUR', color: '#e2561b',
    intro: 'Euroliga je najvyššia európska basketbalová súťaž, hrá sa vo štvrtok a v piatok večer.' },
  // Grand Slams before ATP/WTA: competitionOf() takes the first match.
  { id: 'wimbledon', slug: 'wimbledon', name: 'Wimbledon', sp: 43, match: /Wimbledon/, short: 'W', color: '#2f5d32',
    intro: 'Wimbledon je najstarší a najprestížnejší tenisový turnaj, hrá sa na tráve v Londýne od konca júna do polovice júla.' },
  { id: 'roland-garros', slug: 'roland-garros', name: 'Roland Garros', sp: 43, match: /Roland|French Open/, short: 'RG', color: '#b4532a',
    intro: 'Roland Garros je grandslam na antuke v Paríži, hrá sa od konca mája do začiatku júna.' },
  { id: 'us-open', slug: 'us-open', name: 'US Open', sp: 43, match: /US Open/, short: 'USO', color: '#1d3f8a',
    intro: 'US Open v New Yorku uzatvára grandslamovú sezónu koncom augusta a v septembri. Večerné zápasy sa u nás začínajú po polnoci.' },
  { id: 'australian-open', slug: 'australian-open', name: 'Australian Open', sp: 43, match: /Australian Open/, short: 'AO', color: '#1d76b8',
    intro: 'Australian Open v Melbourne otvára sezónu v januári. Pre časový posun sa hrá od noci do popoludnia nášho času.' },
  { id: 'atp', slug: 'atp', name: 'ATP', sp: 43, match: /^ATP /, short: 'ATP', color: '#003a70', top: true,
    intro: 'Všetky turnaje ATP na jednom mieste – Masters, päťstovky aj dvestopäťdesiatky. Zápasy bežia súčasne na viacerých kurtoch.' },
  { id: 'wta', slug: 'wta', name: 'WTA', sp: 43, match: /^WTA /, short: 'WTA', color: '#6b2c91', top: true,
    intro: 'Turnaje WTA vrátane zápasov slovenských tenistiek. Poradie zápasov sa zostavuje deň vopred.' },
  { id: 'oktagon', slug: 'oktagon', name: 'Oktagon', sp: 208, match: /^Oktagon/, short: 'OKT', color: '#8a1414', top: true, sk: true,
    seo: { title: 'Oktagon MMA – zápasy, výsledky a kde pozerať', faq: [{ q: 'Kde pozerať Oktagon?', a: "Galavečery Oktagonu sa predávajú ako PPV na oficiálnej platforme OKTAGON.TV. K zápasom v ponuke stávkových kancelárií nájdeš u nás čas a živé štatistiky." }] },
    body: "<h2>Oktagon MMA – zápasy, výsledky a kde pozerať</h2><p>Oktagon MMA je najväčšia MMA organizácia v strednej Európe, galavečery sa konajú na Slovensku, v Česku aj v zahraničí. Na tejto stránke nájdeš zápasy najbližšieho turnaja, ktoré sú už v ponuke, s časom a odkazom na živé štatistiky.</p><h3>Kde pozerať Oktagon</h3><p>Galavečery sa predávajú ako PPV na oficiálnej platforme OKTAGON.TV. Karta zápasov sa môže meniť až do poslednej chvíle, preto sa program na tejto stránke priebežne aktualizuje.</p>",
    intro: 'Oktagon MMA je najväčšia MMA organizácia v strednej Európe, založená na Slovensku. Galavečery sa konajú približne raz do mesiaca na Slovensku, v Česku aj v zahraničí, hlavné zápasy sa začínajú vo večerných hodinách.' },
  { id: 'ufc', slug: 'ufc', name: 'UFC', sp: 208, match: /^UFC/, short: 'UFC', color: '#b30b0b', top: true,
    intro: 'UFC je najvyššia súťaž MMA na svete. Hlavné karty v amerických časoch sú u nás v noci a skoro ráno, európske podujatia večer.' },
  { id: 'clash', slug: 'clash', name: 'Clash MMA', sp: 208, match: /^Clash/, short: 'CL', color: '#3b1d6e',
    intro: 'Clash MMA organizuje galavečery so známymi menami českého a slovenského MMA aj zápasy influencerov.' },
];

const BY_SLUG = new Map(COMPETITIONS.map((c) => [`${c.sp}|${c.slug}`, c]));
const BY_ID = new Map(COMPETITIONS.map((c) => [c.id, c]));
export const competitionBySlug = (sp: number, slug: string) => BY_SLUG.get(`${sp}|${slug}`);
export const competitionById = (id: string) => BY_ID.get(id);

/** The curated competition a Tipsport match belongs to (null for everything else). */
export function competitionOf(sp: number, lg: string): Competition | null {
  for (const c of COMPETITIONS) if (c.sp === sp && c.match.test(lg)) return c;
  return null;
}

/** Display name: ours for curated competitions, otherwise the feed name in Slovak. */
export const leagueName = (sp: number, lg: string) => competitionOf(sp, lg)?.name ?? skLeague(lg);

/** URL slug: curated slug when known, otherwise derived from the Slovak name. */
export const competitionSlug = (sp: number, lg: string) => competitionOf(sp, lg)?.slug ?? slugify(skLeague(lg));
