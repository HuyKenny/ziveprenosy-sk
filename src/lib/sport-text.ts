import type { Sport } from './sports';
import { BONUS } from './bonus';

/** Short lead under the H1 of a sport page. */
const LEADS: Record<string, string> = {
  futbal: 'Futbal online každý deň: Niké liga, Liga majstrov, Premier League aj nižšie súťaže z celého sveta. Vyber zápas a pozeraj ho naživo.',
  hokej: 'Hokej online – Tipsport liga, NHL, česká extraliga a európske ligy. Zápasy NHL sa u nás začínajú okolo polnoci.',
  tenis: 'Tenis online: turnaje ATP, WTA, Challenger aj ITF. Na kurtoch sa hrá súčasne, takže naživo bežia aj desiatky zápasov.',
  mma: 'MMA online – Oktagon, UFC, Clash a ďalšie galavečery. Pri každom zápase čas a odkaz na prenos alebo štatistiky.',
  basketbal: 'Basketbal online – NBA, Euroliga a európske ligy. NBA sa hrá v noci nášho času.',
  volejbal: 'Volejbal online: európske poháre a silné zahraničné ligy s priebežným stavom setov.',
  hadzana: 'Hádzaná online: Liga majstrov a zahraničné ligy so živým skóre.',
  sipky: 'Šípky online – turnaje PDC a ďalšie súťaže, ktoré bežia takmer každý deň.',
  'stolny-tenis': 'Stolný tenis má v programe najviac zápasov – turnaje bežia od rána do noci a zápas trvá okolo pol hodiny.',
  esporty: 'E-športy online – Counter-Strike, League of Legends, Dota 2 a ďalšie. Turnajové série bežia celý deň.',
};
export const sportLead = (s: Sport) => LEADS[s.slug] ?? `${s.name} online: zápasy s prenosom a živým skóre. Čas začiatku nájdeš pri každom zápase.`;

/** Longer copy for the main sports (HTML). No claims that go stale within weeks. */
const BODIES: Record<string, string> = {
  futbal: `
<h2>Kde pozerať futbal online</h2>
<p>Väčšinu zápasov v zozname môžeš pozerať naživo po bezplatnej registrácii. Stačí účet a prihlásenie, staviť si nemusíš. Pri zápasoch, ktorých televízne práva má niekto iný, sú k dispozícii aspoň živé štatistiky a priebežné skóre – v zozname majú tlačidlo „Štatistiky“.</p>
<h2>Ktoré súťaže tu nájdeš</h2>
<p>Zo slovenského futbalu <a href="/futbal/nike-liga/">Niké ligu</a> a <a href="/futbal/2-liga/">2. ligu</a>, z pohárov <a href="/futbal/liga-majstrov/">Ligu majstrov</a>, <a href="/futbal/europska-liga/">Európsku ligu</a> a <a href="/futbal/konferencna-liga/">Konferenčnú ligu</a>. Z top líg <a href="/futbal/premier-league/">Premier League</a>, <a href="/futbal/la-liga/">La Ligu</a>, <a href="/futbal/bundesliga/">Bundesligu</a>, <a href="/futbal/serie-a/">Serie A</a> a <a href="/futbal/ligue-1/">Ligue 1</a>. K tomu desiatky nižších a zámorských súťaží, pri ktorých je video takmer vždy.</p>
<h2>Kedy sa hrá</h2>
<p>Európske poháre majú pevné časy: Liga majstrov utorok a streda, Európska a Konferenčná liga štvrtok, výkopy o 18:45 a 21:00. Ligy sa hrajú od piatka do pondelka. Juhoamerické zápasy sa začínajú v noci, ázijské dopoludnia – futbal má preto živý prenos takmer v každú dennú dobu.</p>`,
  hokej: `
<h2>Kde pozerať hokej online</h2>
<p>Naživo sa vysiela veľká časť hokejových zápasov – od zahraničných líg po nižšie súťaže. Pri zápasoch, kde majú práva televízie, nájdeš aspoň živé štatistiky a priebežné skóre.</p>
<h2>NHL v našom čase</h2>
<p>Zápasy <a href="/hokej/nhl/">NHL</a> sa u nás začínajú väčšinou medzi 0:00 a 2:00 v noci, víkendové zápasy aj popoludní a večer. Program na noc nájdeš už večer v <a href="/program/zajtra/">programe na zajtra</a>, časy sú vždy prepočítané na slovenský čas.</p>
<h2>Slovenská a česká liga</h2>
<p>Domácu <a href="/hokej/tipsport-liga/">Tipsport ligu</a> dávame na začiatok zoznamu. Sledujeme aj <a href="/hokej/ceska-extraliga/">českú extraligu</a>, kde hrá veľa Slovákov, a švédsku, fínsku či švajčiarsku ligu, pri ktorých býva video častejšie.</p>`,
  tenis: `
<h2>Kde pozerať tenis online</h2>
<p>Tenis má najväčšiu ponuku živého videa: vysielajú sa turnaje <a href="/tenis/atp/">ATP</a>, <a href="/tenis/wta/">WTA</a>, Challengery aj ITF – na veľkých turnajoch bežia súčasne desiatky zápasov.</p>
<h2>Ako sa v programe vyznať</h2>
<p>Turnaje majú v názve mesto a povrch (antuka, tvrdý povrch, tráva), štvorhra je označená. Časy sú orientačné: zápas sa začína až po skončení predchádzajúceho na tom istom kurte. Pri bežiacich zápasoch preto ukazujeme priebežný stav, ktorý sa obnovuje každých 30 sekúnd.</p>
<p>Zápasy slovenských tenistiek a tenistov nájdeš najrýchlejšie cez vyhľadávanie – napíš priezvisko a uvidíš všetky ich zápasy v ponuke.</p>`,
  mma: `
<h2>Kde pozerať MMA online</h2>
<p>Galavečery <a href="/mma/oktagon/">Oktagonu</a>, <a href="/mma/clash/">Clash MMA</a> a ďalších organizácií sa predávajú ako PPV u organizátora alebo vysielajú v televízii. K zápasom nájdeš živé štatistiky, pri niektorých podujatiach aj video. <a href="/mma/ufc/">UFC</a> má hlavné karty v amerických časoch, u nás teda v noci a ráno.</p>
<h2>Čo tu nájdeš</h2>
<p>Program zápasov s časom začiatku, ktoré stávkové kancelárie už vypísali. Zápasy sa do ponuky dostávajú zvyčajne niekoľko dní pred galavečerom, karta sa môže až do poslednej chvíle meniť.</p>`,
  basketbal: `
<h2>Kde pozerať basketbal online</h2>
<p>Basketbal má video hlavne pri európskych súťažiach a zahraničných ligách. Pri <a href="/basketbal/nba/">NBA</a> nájdeš živé skóre po štvrtinách.</p>
<h2>NBA v noci</h2>
<p>Zápasy NBA sa u nás začínajú medzi 1:00 a 4:30 ráno, nedeľné zápasy občas už večer. Program na noc je v <a href="/program/zajtra/">programe na zajtra</a>.</p>`,
};
export const sportBody = (s: Sport) => BODIES[s.slug] ?? '';

export function sportFaq(s: Sport, hasLive: boolean): { q: string; a: string }[] {
  const n = s.name.toLowerCase();
  return [
    { q: `Kde pozerať ${n} online zadarmo?`, a: `Zápasy s videom môžu registrovaní hráči pozerať naživo. Pozeranie je bezplatné, staviť si nemusíš. Noví hráči dostanú za registráciu bonus ${BONUS.amount}.` },
    { q: hasLive ? `Aké zápasy ${s.genitive} práve bežia?` : `Kedy sa hrá ďalší zápas ${s.genitive}?`, a: hasLive ? 'Zoznam „Naživo“ na tejto stránke ukazuje všetky práve bežiace zápasy s priebežným skóre, ktoré sa samo obnovuje.' : 'Program na najbližších 7 dní je na tejto stránke, zoradený podľa súťaží a času začiatku.' },
    { q: 'V akom čase sú zápasy uvedené?', a: 'V slovenskom čase (SEČ/SELČ), aj pri zámorských súťažiach.' },
  ];
}

/** Sports with a "dnes" page (search demand for "<šport> dnes"). */
export const TODAY_SPORTS = new Set(['futbal', 'hokej', 'tenis', 'basketbal', 'volejbal', 'hadzana', 'mma', 'sipky']);
