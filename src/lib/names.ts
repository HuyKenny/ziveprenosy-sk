/**
 * The match feed comes from the Czech Tipsport (shared with sportstreamy.cz), so competition and national-team
 * names are Czech. These maps turn them into Slovak for display. Club names stay as they are (they are the same
 * in both languages or are foreign anyway). Unknown words fall through unchanged.
 */

/** Czech adjective (as Tipsport writes it in "1. italská liga") → Slovak. */
const ADJ: Record<string, string> = {
  anglická: 'anglická', italská: 'talianska', španělská: 'španielska', německá: 'nemecká', francouzská: 'francúzska',
  argentinská: 'argentínska', japonská: 'japonská', belgická: 'belgická', nizozemská: 'holandská', norská: 'nórska',
  brazilská: 'brazílska', ekvádorská: 'ekvádorská', švýcarská: 'švajčiarska', jihokorejská: 'juhokórejská',
  řecká: 'grécka', uruguayská: 'uruguajská', portugalská: 'portugalská', mexická: 'mexická', chilská: 'čilská',
  rakouská: 'rakúska', izraelská: 'izraelská', turecká: 'turecká', peruánská: 'peruánska', polská: 'poľská',
  kolumbijská: 'kolumbijská', švédská: 'švédska', litevská: 'litovská', venezuelská: 'venezuelská',
  rumunská: 'rumunská', thajská: 'thajská', paraguayská: 'paraguajská', dánská: 'dánska', bosenská: 'bosnianska',
  maltská: 'maltská', čínská: 'čínska', indonéská: 'indonézska', ukrajinská: 'ukrajinská', kostarická: 'kostarická',
  kazašská: 'kazašská', australská: 'austrálska', indická: 'indická', ázerbájdžánská: 'azerbajdžanská',
  britská: 'britská', britský: 'britský', nikaragujská: 'nikaragujská', finská: 'fínska', bahrajnská: 'bahrajnská',
  honduraská: 'honduraská', chorvatská: 'chorvátska', skotská: 'škótska', srbská: 'srbská', salvadorská: 'salvádorská',
  estonská: 'estónska', gruzínská: 'gruzínska', velšská: 'waleská', islandská: 'islandská', novozélandská: 'novozélandská',
  bolivijská: 'bolívijská', lotyšská: 'lotyšská', česká: 'česká', slovenská: 'slovenská', jadranská: 'jadranská',
  alpská: 'alpská', maďarská: 'maďarská', slovinská: 'slovinská', bulharská: 'bulharská', irská: 'írska',
  severoirská: 'severoírska', kyperská: 'cyperská', egyptská: 'egyptská', marocká: 'marocká', saúdská: 'saudská',
  katarská: 'katarská', íránská: 'iránska', italský: 'taliansky', anglický: 'anglický', německý: 'nemecký',
  španělský: 'španielsky', francouzský: 'francúzsky',
};

/** Whole phrases and words (applied before the adjective map). */
const PHRASES: [RegExp, string][] = [
  [/Liga mistrů/g, 'Liga majstrov'],
  [/Evropská liga/g, 'Európska liga'],
  [/Konferenční liga/g, 'Konferenčná liga'],
  [/Mistrovství světa/g, 'Majstrovstvá sveta'],
  [/Mistrovství Evropy/g, 'Majstrovstvá Európy'],
  [/Lotyšsko-Estonská/g, 'Lotyšsko-estónska'],
  [/Národní Liga/g, 'Národná liga'],
  [/tvrdý p\./g, 'tvrdý povrch'],
  [/\b4hra\b/g, 'štvorhra'],
  [/kvalifikace/g, 'kvalifikácia'],
  [/přátelské zápasy|Přátelské zápasy/g, 'Prípravné zápasy'],
  [/Bělehrad/g, 'Belehrad'], [/junioři/g, 'juniori'], [/dorost/g, 'dorast'],
  [/Vídeň/g, 'Viedeň'], [/Basilej/g, 'Bazilej'], [/Mnichov/g, 'Mníchov'], [/Řím/g, 'Rím'], [/Paříž/g, 'Paríž'],
];

/** Czech country / national-team names → Slovak. Matched at the start of a team name ("Německo U21", "Česko (ž)"). */
const COUNTRY: Record<string, string> = {
  Německo: 'Nemecko', Rakousko: 'Rakúsko', Polsko: 'Poľsko', Anglie: 'Anglicko', Skotsko: 'Škótsko', Irsko: 'Írsko',
  'Severní Irsko': 'Severné Írsko', Francie: 'Francúzsko', Španělsko: 'Španielsko', Itálie: 'Taliansko',
  Nizozemsko: 'Holandsko', Belgie: 'Belgicko', Švýcarsko: 'Švajčiarsko', Norsko: 'Nórsko', Finsko: 'Fínsko',
  Řecko: 'Grécko', Chorvatsko: 'Chorvátsko', 'Černá Hora': 'Čierna Hora', Bělorusko: 'Bielorusko',
  Estonsko: 'Estónsko', Kazachstán: 'Kazachstan', Gruzie: 'Gruzínsko', Arménie: 'Arménsko', Ázerbájdžán: 'Azerbajdžan',
  Kypr: 'Cyprus', Lucembursko: 'Luxembursko', Albánie: 'Albánsko', 'Severní Makedonie': 'Severné Macedónsko',
  Brazílie: 'Brazília', Argentina: 'Argentína', Uruguay: 'Uruguaj', Kolumbie: 'Kolumbia', Chile: 'Čile',
  Paraguay: 'Paraguaj', 'Jižní Korea': 'Južná Kórea', 'Severní Korea': 'Severná Kórea', Austrálie: 'Austrália',
  Nigérie: 'Nigéria', 'Pobřeží slonoviny': 'Pobrežie Slonoviny', 'Jihoafrická republika': 'Juhoafrická republika',
  'Saúdská Arábie': 'Saudská Arábia', Írán: 'Irán', Slovinsko: 'Slovinsko', Lotyšsko: 'Lotyšsko', Litva: 'Litva',
  Dánsko: 'Dánsko', Švédsko: 'Švédsko', Maďarsko: 'Maďarsko', Rumunsko: 'Rumunsko', Bulharsko: 'Bulharsko',
  Turecko: 'Turecko', Ukrajina: 'Ukrajina', Kanada: 'Kanada', Japonsko: 'Japonsko', Čína: 'Čína', Tunisko: 'Tunisko',
  Alžírsko: 'Alžírsko', Egypt: 'Egypt', Maroko: 'Maroko', Ekvádor: 'Ekvádor', Mexiko: 'Mexiko', Island: 'Island',
  Moldavsko: 'Moldavsko', Kosovo: 'Kosovo', Izrael: 'Izrael', 'Velká Británie': 'Veľká Británia',
  'Nový Zéland': 'Nový Zéland', Indie: 'India', Indonésie: 'Indonézia', Thajsko: 'Thajsko', Vietnam: 'Vietnam',
};
const COUNTRY_RE = new RegExp(`^(${Object.keys(COUNTRY).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?=$|[\\s(])`);
const ADJ_RE = new RegExp(`(^|[\\s(.-])(${Object.keys(ADJ).sort((a, b) => b.length - a.length).join('|')})(?=$|[\\s,).])`, 'giu');

/** Czech letters Slovak does not have — last resort for anything the maps above missed. */
const CZ_ONLY: Record<string, string> = { ě: 'e', Ě: 'E', ř: 'r', Ř: 'R', ů: 'ú', Ů: 'Ú' };

/** Competition name from the feed → Slovak. */
export function skLeague(lg: string): string {
  let s = lg;
  for (const [re, to] of PHRASES) s = s.replace(re, to);
  s = s.replace(ADJ_RE, (_, pre: string, w: string) => {
    const lower = w.toLowerCase();
    const sk = ADJ[lower] ?? w;
    return pre + (w[0] === w[0].toUpperCase() ? sk[0].toUpperCase() + sk.slice(1) : sk);
  });
  return s.replace(/[ěĚřŘůŮ]/g, (c) => CZ_ONLY[c]);
}


/** Czech words in event names (motorsport, team events) → Slovak. */
const EVENT: [RegExp, string][] = [
  [/hlavní závod/g, 'hlavné preteky'], [/kvalifikace/g, 'kvalifikácia'], [/závod/g, 'preteky'],
  [/^Tým /, 'Tím '], [/bojovníků/g, 'bojovníkov'],
];

/** Team / player / event name from the feed → Slovak (national teams and a few event words; clubs and players unchanged). */
export function skTeam(name: string): string {
  let s = name.replace(COUNTRY_RE, (c) => COUNTRY[c] ?? c).replace(/^VC (\S+)/, (_, c: string) => `VC ${COUNTRY[c] ?? c}`);
  for (const [re, to] of EVENT) s = s.replace(re, to);
  return s;
}

/** Live clock / period text from the Czech feed ("2.tř. - 34.min", "Za 5 minut", "Přestávka") → Slovak. */
export function skClock(ti: string): string {
  return ti
    .replace(/^Za okamžik$/, 'O chvíľu')
    .replace(/^Za (\d+) minut[uy]?$/, 'O $1 min')
    .replace(/\btř\./g, 'tr.').replace(/(\d)\.tř\./g, '$1.tr.')
    .replace(/(\d)\.čt\./g, '$1.štv.')
    .replace(/přestávka/g, 'prestávka').replace(/Přestávka/g, 'Prestávka')
    .replace(/Poločas/g, 'Polčas')
    .replace(/Konec základní hrací doby/g, 'Koniec riadneho času')
    .replace(/Konec/g, 'Koniec')
    .replace(/Přerušeno/g, 'Prerušené')
    .replace(/Prodloužení/g, 'Predĺženie')
    .replace(/Nájezdy/g, 'Nájazdy')
    .replace(/Lepší ze? (\d+)/g, 'BO$1');
}

/** Short clock for list rows: period + minute only ("3.tr. 56'"), without the per-period scores. */
export const skClockShort = (ti: string) => skClock(ti).replace(/\s*\(.*$/, '').replace(/\s+\d+na\d+$/, '').replace(/ - (\d+(?:\+\d+)?)\.min$/, " $1'");
