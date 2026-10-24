/** Tipsport idSuperSport → our section. Order = menu order; `main` ones are in the top navigation. */
export interface Sport { id: number; slug: string; name: string; genitive: string; main: boolean }

export const SPORTS: Sport[] = [
  { id: 16, slug: 'futbal', name: 'Futbal', genitive: 'futbalu', main: true },
  { id: 23, slug: 'hokej', name: 'Hokej', genitive: 'hokeja', main: true },
  { id: 43, slug: 'tenis', name: 'Tenis', genitive: 'tenisu', main: true },
  { id: 208, slug: 'mma', name: 'MMA', genitive: 'MMA', main: true },
  { id: 7, slug: 'basketbal', name: 'Basketbal', genitive: 'basketbalu', main: true },
  { id: 47, slug: 'volejbal', name: 'Volejbal', genitive: 'volejbalu', main: false },
  { id: 20, slug: 'hadzana', name: 'Hádzaná', genitive: 'hádzanej', main: false },
  { id: 14, slug: 'florbal', name: 'Florbal', genitive: 'florbalu', main: false },
  { id: 17, slug: 'futsal', name: 'Futsal', genitive: 'futsalu', main: false },
  { id: 42, slug: 'sipky', name: 'Šípky', genitive: 'šípok', main: false },
  { id: 11, slug: 'box', name: 'Box', genitive: 'boxu', main: false },
  { id: 37, slug: 'snooker', name: 'Snooker', genitive: 'snookeru', main: false },
  { id: 40, slug: 'stolny-tenis', name: 'Stolný tenis', genitive: 'stolného tenisu', main: false },
  { id: 188, slug: 'esporty', name: 'E-športy', genitive: 'e-športov', main: false },
  { id: 26, slug: 'motorsport', name: 'Motoršport', genitive: 'motoršportu', main: false },
  { id: 2, slug: 'americky-futbal', name: 'Americký futbal', genitive: 'amerického futbalu', main: false },
  { id: 6, slug: 'baseball', name: 'Baseball', genitive: 'baseballu', main: false },
  { id: 31, slug: 'rugby', name: 'Rugby', genitive: 'rugby', main: false },
  { id: 88, slug: 'bedminton', name: 'Bedminton', genitive: 'bedmintonu', main: false },
  { id: 169, slug: 'kriket', name: 'Kriket', genitive: 'kriketu', main: false },
  { id: 41, slug: 'sach', name: 'Šach', genitive: 'šachu', main: false },
  { id: 35, slug: 'lyzovanie', name: 'Zjazdové lyžovanie', genitive: 'zjazdového lyžovania', main: false },
];

export const SPORT_BY_ID = new Map(SPORTS.map((s) => [s.id, s]));
export const SPORT_BY_SLUG = new Map(SPORTS.map((s) => [s.slug, s]));
