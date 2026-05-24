/* TarixiTimeline — data.jsx
   Две оси классификации: Область (domain) + Место (place).
   Тип объекта (kind: person/event/period) — не тег, а поле.
   Подтип периода (subkind: 'era' | 'state') — не тег, определяет трек.
*/

// ============================================================
// Фасеты
// ============================================================

const FACETS = {
  domain: { id: 'domain', name: 'Область',  hint: 'К какой сфере относится' },
  place:  { id: 'place',  name: 'Место',    hint: 'Где происходит' },
};

// ============================================================
// Каталог тегов
// ============================================================

const TAG_CATALOG = [
  // Область — как "categories" в History Timeline / Histography
  { id: 'politics', name: 'Политика',       facet: 'domain', color: '#e6b94a' },
  { id: 'war',      name: 'Войны',           facet: 'domain', color: '#ef5a6a' },
  { id: 'science',  name: 'Наука',           facet: 'domain', color: '#5cd4ec' },
  { id: 'culture',  name: 'Культура',        facet: 'domain', color: '#b27cff' },
  { id: 'religion', name: 'Религия',         facet: 'domain', color: '#f7903a' },
  { id: 'economy',  name: 'Экономика',       facet: 'domain', color: '#9fe07b' },

  // Место — стандартные географические регионы
  { id: 'kz',      name: 'Казахстан',        facet: 'place',  color: '#38bdf8' },
  { id: 'asia',    name: 'Азия',             facet: 'place',  color: '#ffd166' },
  { id: 'mideast', name: 'Ближний Восток',   facet: 'place',  color: '#ff9f43' },
  { id: 'europe',  name: 'Европа',           facet: 'place',  color: '#5fd49a' },
  { id: 'america', name: 'Америка',          facet: 'place',  color: '#ff6b6b' },
  { id: 'africa',  name: 'Африка',           facet: 'place',  color: '#da77f2' },
  { id: 'global',  name: 'Весь мир',         facet: 'place',  color: '#8b91a4' },
];

const TAG_MAP = Object.fromEntries(TAG_CATALOG.map(t => [t.id, t]));

// ============================================================
// Эпохи (навигация + зум)
// ============================================================

const EPOCH_PRESETS = [
  { id: 'ancient',  name: 'Древний мир',  start: -3000, end: 500,  color: '#5e6478' },
  { id: 'medieval', name: 'Средние века', start:  500,  end: 1500, color: '#7a6040' },
  { id: 'modern',   name: 'Новое время',  start:  1500, end: 1900, color: '#4a6080' },
  { id: 'contemp',  name: 'Новейшее',     start:  1900, end: 2025, color: '#3a5a40' },
];

// ============================================================
// Данные
// item.kind   : 'person' | 'event' | 'period'
// item.subkind: 'era' | 'state'  (только для period)
// item.tags   : domain-теги + place-теги (первый domain-тег = основной цвет)
// ============================================================

const ALL_ITEMS = [

  // ── ЛИЧНОСТИ — КАЗАХСТАН ────────────────────────────────────
  {
    id: 'al-farabi', kind: 'person',
    name: 'Аль-Фараби',
    tags: ['science', 'kz'],
    start: 872, end: 950, lifeSpan: '872 — 950',
    desc: 'Средневековый учёный-энциклопедист, философ, математик и музыкант. Уроженец Отрара (близ современного Шымкента). Получил прозвище «Второй учитель» — после Аристотеля.',
  },
  {
    id: 'balas-jur', kind: 'person',
    name: 'Жусуп Баласагун',
    tags: ['culture', 'kz'],
    start: 1020, end: 1085, lifeSpan: '~1020 — ~1085',
    desc: 'Тюркский поэт и мыслитель XI века. Автор «Кутадгу Билиг» — одного из первых литературных памятников тюркского мира.',
  },
  {
    id: 'yassawi', kind: 'person',
    name: 'Ахмет Яссауи',
    tags: ['religion', 'culture', 'kz'],
    start: 1093, end: 1166, lifeSpan: '1093 — 1166',
    desc: 'Тюркский поэт-суфий и религиозный деятель. Основатель суфийского ордена яссавийа.',
  },
  {
    id: 'abay', kind: 'person',
    name: 'Абай Кунанбаев',
    tags: ['culture', 'kz'],
    start: 1845, end: 1904, lifeSpan: '1845 — 1904',
    desc: 'Казахский поэт, композитор и просветитель. Основоположник казахской письменной литературы.',
  },
  {
    id: 'altynsarin', kind: 'person',
    name: 'Ыбырай Алтынсарин',
    tags: ['science', 'culture', 'kz'],
    start: 1841, end: 1889, lifeSpan: '1841 — 1889',
    desc: 'Казахский педагог, просветитель и писатель. Открыл первые казахские школы с системой светского образования.',
  },
  {
    id: 'valikhanov', kind: 'person',
    name: 'Шокан Уалиханов',
    tags: ['science', 'kz'],
    start: 1835, end: 1865, lifeSpan: '1835 — 1865',
    desc: 'Казахский учёный, путешественник, этнограф и историк. Тайно посетил Кашгар. Друг Достоевского.',
  },
  {
    id: 'auezov', kind: 'person',
    name: 'Мухтар Ауэзов',
    tags: ['culture', 'kz'],
    start: 1897, end: 1961, lifeSpan: '1897 — 1961',
    desc: 'Казахский писатель и драматург. Автор эпопеи «Путь Абая», переведённой на десятки языков.',
  },
  {
    id: 'kerey-khan', kind: 'person',
    name: 'Керей Хан',
    tags: ['politics', 'kz'],
    start: 1409, end: 1480, lifeSpan: '1409 — 1480',
    desc: 'Первый хан Казахского ханства (1465). Увёл казахские роды в Семиречье, заложив государственность казахского народа.',
  },
  {
    id: 'kasym-khan', kind: 'person',
    name: 'Касым Хан',
    tags: ['politics', 'kz'],
    start: 1445, end: 1518, lifeSpan: '1445 — 1518',
    desc: 'Хан Казахского ханства (1509–1518). При нём государство достигло наибольшего могущества — более миллиона подданных.',
  },
  {
    id: 'ablai-khan', kind: 'person',
    name: 'Абылай Хан',
    tags: ['politics', 'kz'],
    start: 1711, end: 1781, lifeSpan: '1711 — 1781',
    desc: 'Хан Казахского ханства, объединивший все три жуза. Умелый дипломат между Россией и Китаем.',
  },

  // ── ЛИЧНОСТИ — МИР ──────────────────────────────────────────
  {
    id: 'alexander', kind: 'person',
    name: 'Александр Македонский',
    tags: ['politics', 'war', 'europe'],
    start: -356, end: -323, lifeSpan: '356 — 323 до н.э.',
    desc: 'Царь Македонии. Создал крупнейшую империю Древнего мира — от Балкан до Индии за 13 лет.',
  },
  {
    id: 'chinggis', kind: 'person',
    name: 'Чингис Хан',
    tags: ['politics', 'war', 'asia'],
    start: 1162, end: 1227, lifeSpan: '~1162 — 1227',
    desc: 'Основатель Монгольской империи. Объединил разрозненные племена и создал крупнейшую сухопутную империю в истории.',
  },
  {
    id: 'timur', kind: 'person',
    name: 'Тамерлан',
    tags: ['politics', 'war', 'mideast'],
    start: 1336, end: 1405, lifeSpan: '1336 — 1405',
    desc: 'Среднеазиатский завоеватель. Создал империю Тимуридов со столицей в Самарканде. Разгромил Золотую Орду и Османскую империю.',
  },
  {
    id: 'avicenna', kind: 'person',
    name: 'Авиценна (Ибн Сина)',
    tags: ['science', 'mideast'],
    start: 980, end: 1037, lifeSpan: '980 — 1037',
    desc: 'Персидский учёный из Бухары. «Канон врачебной науки» — главный медицинский учебник Европы и Азии на протяжении 600 лет.',
  },
  {
    id: 'leonardo', kind: 'person',
    name: 'Леонардо да Винчи',
    tags: ['science', 'culture', 'europe'],
    start: 1452, end: 1519, lifeSpan: '1452 — 1519',
    desc: 'Художник, учёный и изобретатель эпохи Возрождения. «Мона Лиза», «Тайная вечеря», чертежи летательных машин.',
  },
  {
    id: 'newton', kind: 'person',
    name: 'Исаак Ньютон',
    tags: ['science', 'europe'],
    start: 1643, end: 1727, lifeSpan: '1643 — 1727',
    desc: 'Английский физик. Сформулировал закон всемирного тяготения и три закона механики.',
  },
  {
    id: 'napoleon', kind: 'person',
    name: 'Наполеон Бонапарт',
    tags: ['politics', 'war', 'europe'],
    start: 1769, end: 1821, lifeSpan: '1769 — 1821',
    desc: 'Французский военачальник и император. Перекроил карту Европы, распространил идеи Французской революции.',
  },
  {
    id: 'marx', kind: 'person',
    name: 'Карл Маркс',
    tags: ['science', 'politics', 'europe'],
    start: 1818, end: 1883, lifeSpan: '1818 — 1883',
    desc: 'Философ и экономист. Автор «Капитала» и «Манифеста коммунистической партии». Его идеи определили XX век.',
  },
  {
    id: 'einstein', kind: 'person',
    name: 'Альберт Эйнштейн',
    tags: ['science', 'europe'],
    start: 1879, end: 1955, lifeSpan: '1879 — 1955',
    desc: 'Физик-теоретик. Создал специальную и общую теории относительности. E=mc².',
  },

  // ── ГОСУДАРСТВА (period, subkind: 'state') ─────────────────
  {
    id: 'kz-khanate', kind: 'period', subkind: 'state',
    name: 'Казахское ханство',
    tags: ['politics', 'kz'],
    start: 1465, end: 1847,
    desc: 'Государство казахов, основанное Кереем и Жанибеком. Охватывало все три жуза.',
  },
  {
    id: 'kz-soviet', kind: 'period', subkind: 'state',
    name: 'Казахская ССР',
    tags: ['politics', 'kz'],
    start: 1936, end: 1991,
    desc: 'Советская республика в составе СССР. Индустриализация, целина, ядерные испытания на Семипалатинском полигоне.',
  },
  {
    id: 'mongol-empire', kind: 'period', subkind: 'state',
    name: 'Монгольская империя',
    tags: ['politics', 'war', 'asia'],
    start: 1206, end: 1368,
    desc: 'Крупнейшая сухопутная империя. На пике — 24 млн кв. км, от Тихого океана до Восточной Европы.',
  },
  {
    id: 'roman-empire', kind: 'period', subkind: 'state',
    name: 'Римская империя',
    tags: ['politics', 'europe'],
    start: -27, end: 476,
    desc: 'Охватывала всё Средиземноморье. Заложила основы европейского права, языка и градостроительства.',
  },
  {
    id: 'ussr', kind: 'period', subkind: 'state',
    name: 'СССР',
    tags: ['politics', 'global'],
    start: 1922, end: 1991,
    desc: 'Сверхдержава холодной войны. Космическая гонка, ГУЛАГ, индустриализация, атомная бомба.',
  },
  {
    id: 'ottoman', kind: 'period', subkind: 'state',
    name: 'Османская империя',
    tags: ['politics', 'mideast'],
    start: 1299, end: 1922,
    desc: 'Одна из долговечнейших империй. Охватывала Ближний Восток, Северную Африку и часть Европы.',
  },

  // ── ЭПОХИ (period, subkind: 'era') ─────────────────────────
  {
    id: 'ancient', kind: 'period', subkind: 'era',
    name: 'Древний мир',
    tags: ['global'],
    start: -3000, end: 500,
    desc: 'От первых цивилизаций (Шумер, Египет) до падения Западной Римской империи.',
  },
  {
    id: 'medieval', kind: 'period', subkind: 'era',
    name: 'Средние века',
    tags: ['global'],
    start: 500, end: 1500,
    desc: 'Расцвет ислама, крестовые походы, чума, феодализм, рождение университетов.',
  },
  {
    id: 'modern', kind: 'period', subkind: 'era',
    name: 'Новое время',
    tags: ['global'],
    start: 1500, end: 1900,
    desc: 'Великие открытия, научная революция, Просвещение, индустриализация, колониализм.',
  },
  {
    id: 'contemporary', kind: 'period', subkind: 'era',
    name: 'Новейшее время',
    tags: ['global'],
    start: 1900, end: 2025,
    desc: 'Две мировые войны, деколонизация, цифровая революция, глобализация.',
  },
  {
    id: 'steppe-era', kind: 'period', subkind: 'era',
    name: 'Эпоха кочевников',
    tags: ['asia', 'kz'],
    start: -500, end: 1500,
    desc: 'Скифы, гунны, тюрки, монголы — волны народов, сформировавшие облик Казахстана и Центральной Азии.',
  },
  {
    id: 'islamic-golden', kind: 'period', subkind: 'era',
    name: 'Золотой век ислама',
    tags: ['science', 'culture', 'mideast'],
    start: 750, end: 1258,
    desc: 'Расцвет исламской науки, философии и медицины. Аль-Фараби и Авиценна — продукты этой эпохи.',
  },

  // ── СОБЫТИЯ ─────────────────────────────────────────────────
  {
    id: 'talas', kind: 'event',
    name: 'Таласская битва',
    tags: ['war', 'kz', 'asia'],
    start: 751, end: 751,
    desc: 'Сражение Аббасидского халифата и Китая у реки Талас. Средняя Азия осталась исламской. Китайские пленники передали арабам секрет бумаги.',
  },
  {
    id: 'mongol-invasion', kind: 'event',
    name: 'Монгольское нашествие',
    tags: ['war', 'asia', 'mideast'],
    start: 1219, end: 1221,
    desc: 'Завоевание Средней Азии Чингис Ханом. Разрушение Самарканда, Бухары и Ургенча.',
  },
  {
    id: 'fr-revolution', kind: 'event',
    name: 'Французская революция',
    tags: ['politics', 'europe'],
    start: 1789, end: 1799,
    desc: '«Свобода, Равенство, Братство». Свержение монархии, якобинский террор, рождение современной демократии.',
  },
  {
    id: 'ww1', kind: 'event',
    name: 'Первая мировая война',
    tags: ['war', 'europe'],
    start: 1914, end: 1918,
    desc: 'Первый глобальный конфликт. 17 млн погибших. Распад четырёх империй.',
  },
  {
    id: 'ww2', kind: 'event',
    name: 'Вторая мировая война',
    tags: ['war', 'global'],
    start: 1939, end: 1945,
    desc: 'Крупнейший конфликт в истории. 70–85 млн погибших. Холокост, атомная бомба, ООН.',
  },
  {
    id: 'kz-independence', kind: 'event',
    name: 'Независимость Казахстана',
    tags: ['politics', 'kz'],
    start: 1991, end: 1991,
    desc: '16 декабря 1991 — Казахстан провозгласил независимость последним из республик СССР.',
  },
  {
    id: 'printing-press', kind: 'event',
    name: 'Изобретение книгопечатания',
    tags: ['science', 'culture', 'europe'],
    start: 1440, end: 1440,
    desc: 'Гутенберг создал подвижный шрифт. Книга стала доступной — начался информационный переворот, предшествующий Реформации.',
  },
];

// ============================================================
// Хелперы
// ============================================================

function itemRange(item) {
  return [item.start, item.end ?? item.start];
}

function itemLabel(item) {
  return item.name;
}

// 'kz' тег = верхняя дорожка (Казахстан), всё остальное — нижняя (Мир)
function itemRegion(item) {
  return item.tags.includes('kz') ? 'kz' : 'world';
}

function primaryTagOf(item) {
  return TAG_MAP[item.tags[0]] || null;
}

function formatYear(y) {
  return y < 0 ? `${-y} до н.э.` : `${y} н.э.`;
}

function formatYearShort(y) {
  return y < 0 ? `−${-y}` : `${y}`;
}

// primary = первый domain-тег; place = первый place-тег; mono = нейтральный
function colorForItem(item, colorBy = 'primary') {
  if (colorBy === 'mono') return 'var(--text-2)';
  if (colorBy === 'place') {
    const pt = item.tags.find(id => TAG_MAP[id]?.facet === 'place');
    return TAG_MAP[pt]?.color || 'var(--text-2)';
  }
  const dt = item.tags.find(id => TAG_MAP[id]?.facet === 'domain');
  return TAG_MAP[dt]?.color || TAG_MAP[item.tags[0]]?.color || 'var(--text-2)';
}

function findContemporaries(item, allItems, limit = 10) {
  const [s, e] = itemRange(item);
  return allItems
    .filter(o => {
      if (o.id === item.id || o.kind !== 'person') return false;
      const [os, oe] = itemRange(o);
      return s <= oe && e >= os;
    })
    .slice(0, limit);
}

// OR внутри фасета, AND между фасетами
// Если у объекта нет тегов данного фасета — он проходит (эпохи без domain-тегов)
function isItemVisible(item, activeTags) {
  for (const facetId of Object.keys(FACETS)) {
    const facetTagIds = TAG_CATALOG.filter(t => t.facet === facetId).map(t => t.id);
    const activeInFacet = facetTagIds.filter(id => activeTags.has(id));
    if (activeInFacet.length === 0) continue;
    const itemInFacet = item.tags.filter(id => facetTagIds.includes(id));
    if (itemInFacet.length === 0) continue;
    if (!itemInFacet.some(id => activeTags.has(id))) return false;
  }
  return true;
}

// ============================================================
// Экспорт
// ============================================================

Object.assign(window, {
  FACETS,
  TAG_CATALOG,
  TAG_MAP,
  EPOCH_PRESETS,
  ALL_ITEMS,
  itemRange,
  itemLabel,
  itemRegion,
  primaryTagOf,
  formatYear,
  formatYearShort,
  colorForItem,
  findContemporaries,
  isItemVisible,
});
