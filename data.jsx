/* TarixiTimeline — data.jsx
    Три структурных вида объектов:
      kind: 'event'   — момент или краткое событие
      kind: 'subject' — конкретная сущность с жизным циклом (subkind определяет тип)
      kind: 'era'     — абстрактный временной контекст (фоновая полоса)
    subkind для 'subject': 'person' | 'people' | 'state' | 'city' | ... (расширяемо)
    
    Universe (Вселенная) — изолированное пространство данных:
      universe: 'main' | string — принадлежность к вселенной (по умолчанию 'main')
 */

// ============================================================
// Фасеты
// ============================================================

const FACETS = {
  domain: { id: 'domain', name: 'Теги', hint: 'К какой сфере относится' },
};

// ============================================================
// Подтипы субъектов (предзаполненные — пользователь может добавлять)
// ============================================================

const SUBKIND_META = {
  person: { label: 'Люди',         icon: '👤' },
  people: { label: 'Народности',   icon: '👥' },
  state:  { label: 'Государства',  icon: '🏛' },
  city:   { label: 'Города',       icon: '🏙' },
};

// ============================================================
// Каталог тегов
// ============================================================

const TAG_CATALOG = [
  // Область
  { id: 'politics', name: 'Политика',       facet: 'domain', color: '#e6b94a' },
  { id: 'war',      name: 'Войны',           facet: 'domain', color: '#ef5a6a' },
  { id: 'science',  name: 'Наука',           facet: 'domain', color: '#5cd4ec' },
  { id: 'culture',  name: 'Культура',        facet: 'domain', color: '#b27cff' },
  { id: 'religion', name: 'Религия',         facet: 'domain', color: '#f7903a' },
  { id: 'economy',  name: 'Экономика',       facet: 'domain', color: '#9fe07b' },

];

const TAG_MAP = Object.fromEntries(TAG_CATALOG.map(t => [t.id, t]));

// ============================================================
// Эпохи (навигация + зум)
// ============================================================

const EPOCH_PRESETS = [
  { id: 'ancient',   name: 'Древний мир',    start: -3000, end: 500,   color: '#5e6478' },
  { id: 'medieval',  name: 'Средние века',   start:  500,  end: 1500,  color: '#7a6040' },
  { id: 'modern',    name: 'Новое время',    start:  1500, end: 1900,  color: '#4a6080' },
  { id: 'contemp',   name: 'Новейшее',       start:  1900, end: 2025,  color: '#3a5a40' },
  // Future epochs - for navigation and visual structure
  { id: 'near-future',  name: 'Ближнее будущее', start:  2025, end: 2050,  color: '#2d6a4f' },
  { id: 'mid-future',   name: 'Среднее будущее', start:  2050, end: 2100,  color: '#1d5045' },
  { id: 'far-future',   name: 'Далёкое будущее', start:  2100, end: 2500,  color: '#0f3d3e' },
];

// ============================================================
// Данные
// ============================================================

const ALL_ITEMS = [

  // ── ЛЮДИ — КАЗАХСТАН ────────────────────────────────────────
  {
    id: 'al-farabi', kind: 'subject', subkind: 'person',
    name: 'Аль-Фараби',
    tags: ['science', 'kz'],
    start: 872, end: 950, lifeSpan: '872 — 950',
    desc: 'Средневековый учёный-энциклопедист, философ, математик и музыкант. Уроженец Отрара (близ современного Шымкента). Получил прозвище «Второй учитель» — после Аристотеля.',
  },
  {
    id: 'balas-jur', kind: 'subject', subkind: 'person',
    name: 'Жусуп Баласагун',
    tags: ['culture', 'kz'],
    start: 1020, end: 1085, lifeSpan: '~1020 — ~1085',
    desc: 'Тюркский поэт и мыслитель XI века. Автор «Кутадгу Билиг» — одного из первых литературных памятников тюркского мира.',
  },
  {
    id: 'yassawi', kind: 'subject', subkind: 'person',
    name: 'Ахмет Яссауи',
    tags: ['religion', 'culture', 'kz'],
    start: 1093, end: 1166, lifeSpan: '1093 — 1166',
    desc: 'Тюркский поэт-суфий и религиозный деятель. Основатель суфийского ордена яссавийа.',
  },
  {
    id: 'abay', kind: 'subject', subkind: 'person',
    name: 'Абай Кунанбаев',
    tags: ['culture', 'kz'],
    start: 1845, end: 1904, lifeSpan: '1845 — 1904',
    desc: 'Казахский поэт, композитор и просветитель. Основоположник казахской письменной литературы.',
  },
  {
    id: 'altynsarin', kind: 'subject', subkind: 'person',
    name: 'Ыбырай Алтынсарин',
    tags: ['science', 'culture', 'kz'],
    start: 1841, end: 1889, lifeSpan: '1841 — 1889',
    desc: 'Казахский педагог, просветитель и писатель. Открыл первые казахские школы с системой светского образования.',
  },
  {
    id: 'valikhanov', kind: 'subject', subkind: 'person',
    name: 'Шокан Уалиханов',
    tags: ['science', 'kz'],
    start: 1835, end: 1865, lifeSpan: '1835 — 1865',
    desc: 'Казахский учёный, путешественник, этнограф и историк. Тайно посетил Кашгар. Друг Достоевского.',
  },
  {
    id: 'auezov', kind: 'subject', subkind: 'person',
    name: 'Мухтар Ауэзов',
    tags: ['culture', 'kz'],
    start: 1897, end: 1961, lifeSpan: '1897 — 1961',
    desc: 'Казахский писатель и драматург. Автор эпопеи «Путь Абая», переведённой на десятки языков.',
  },
  {
    id: 'kerey-khan', kind: 'subject', subkind: 'person',
    name: 'Керей Хан',
    tags: ['politics', 'kz'],
    start: 1409, end: 1480, lifeSpan: '1409 — 1480',
    desc: 'Первый хан Казахского ханства (1465). Увёл казахские роды в Семиречье, заложив государственность казахского народа.',
  },
  {
    id: 'kasym-khan', kind: 'subject', subkind: 'person',
    name: 'Касым Хан',
    tags: ['politics', 'kz'],
    start: 1445, end: 1518, lifeSpan: '1445 — 1518',
    desc: 'Хан Казахского ханства (1509–1518). При нём государство достигло наибольшего могущества — более миллиона подданных.',
  },
  {
    id: 'ablai-khan', kind: 'subject', subkind: 'person',
    name: 'Абылай Хан',
    tags: ['politics', 'kz'],
    start: 1711, end: 1781, lifeSpan: '1711 — 1781',
    desc: 'Хан Казахского ханства, объединивший все три жуза. Умелый дипломат между Россией и Китаем.',
  },

  // ── ЛЮДИ — МИР ──────────────────────────────────────────────
  {
    id: 'alexander', kind: 'subject', subkind: 'person',
    name: 'Александр Македонский',
    tags: ['politics', 'war'],
    start: -356, end: -323, lifeSpan: '356 — 323 до н.э.',
    desc: 'Царь Македонии. Создал крупнейшую империю Древнего мира — от Балкан до Индии за 13 лет.',
  },
  {
    id: 'chinggis', kind: 'subject', subkind: 'person',
    name: 'Чингис Хан',
    tags: ['politics', 'war'],
    start: 1162, end: 1227, lifeSpan: '~1162 — 1227',
    desc: 'Основатель Монгольской империи. Объединил разрозненные племена и создал крупнейшую сухопутную империю в истории.',
  },
  {
    id: 'timur', kind: 'subject', subkind: 'person',
    name: 'Тамерлан',
    tags: ['politics', 'war'],
    start: 1336, end: 1405, lifeSpan: '1336 — 1405',
    desc: 'Среднеазиатский завоеватель. Создал империю Тимуридов со столицей в Самарканде. Разгромил Золотую Орду и Османскую империю.',
  },
  {
    id: 'avicenna', kind: 'subject', subkind: 'person',
    name: 'Авиценна (Ибн Сина)',
    tags: ['science'],
    start: 980, end: 1037, lifeSpan: '980 — 1037',
    desc: 'Персидский учёный из Бухары. «Канон врачебной науки» — главный медицинский учебник Европы и Азии на протяжении 600 лет.',
  },
  {
    id: 'leonardo', kind: 'subject', subkind: 'person',
    name: 'Леонардо да Винчи',
    tags: ['science', 'culture'],
    start: 1452, end: 1519, lifeSpan: '1452 — 1519',
    desc: 'Художник, учёный и изобретатель эпохи Возрождения. «Мона Лиза», «Тайная вечеря», чертежи летательных машин.',
  },
  {
    id: 'newton', kind: 'subject', subkind: 'person',
    name: 'Исаак Ньютон',
    tags: ['science'],
    start: 1643, end: 1727, lifeSpan: '1643 — 1727',
    desc: 'Английский физик. Сформулировал закон всемирного тяготения и три закона механики.',
  },
  {
    id: 'napoleon', kind: 'subject', subkind: 'person',
    name: 'Наполеон Бонапарт',
    tags: ['politics', 'war'],
    start: 1769, end: 1821, lifeSpan: '1769 — 1821',
    desc: 'Французский военачальник и император. Перекроил карту Европы, распространил идеи Французской революции.',
  },
  {
    id: 'marx', kind: 'subject', subkind: 'person',
    name: 'Карл Маркс',
    tags: ['science', 'politics'],
    start: 1818, end: 1883, lifeSpan: '1818 — 1883',
    desc: 'Философ и экономист. Автор «Капитала» и «Манифеста коммунистической партии». Его идеи определили XX век.',
  },
  {
    id: 'einstein', kind: 'subject', subkind: 'person',
    name: 'Альберт Эйнштейн',
    tags: ['science'],
    start: 1879, end: 1955, lifeSpan: '1879 — 1955',
    desc: 'Физик-теоретик. Создал специальную и общую теории относительности. E=mc².',
  },

  // ── ГОСУДАРСТВА ─────────────────────────────────────────────
  {
    id: 'kz-khanate', kind: 'subject', subkind: 'state',
    name: 'Казахское ханство',
    tags: ['politics', 'kz'],
    start: 1465, end: 1847,
    desc: 'Государство казахов, основанное Кереем и Жанибеком. Охватывало все три жуза.',
  },
  {
    id: 'kz-soviet', kind: 'subject', subkind: 'state',
    name: 'Казахская ССР',
    tags: ['politics', 'kz'],
    start: 1936, end: 1991,
    desc: 'Советская республика в составе СССР. Индустриализация, целина, ядерные испытания на Семипалатинском полигоне.',
  },
  {
    id: 'mongol-empire', kind: 'subject', subkind: 'state',
    name: 'Монгольская империя',
    tags: ['politics', 'war'],
    start: 1206, end: 1368,
    desc: 'Крупнейшая сухопутная империя. На пике — 24 млн кв. км, от Тихого океана до Восточной Европы.',
  },
  {
    id: 'roman-empire', kind: 'subject', subkind: 'state',
    name: 'Римская империя',
    tags: ['politics'],
    start: -27, end: 476,
    desc: 'Охватывала всё Средиземноморье. Заложила основы европейского права, языка и градостроительства.',
  },
  {
    id: 'ussr', kind: 'subject', subkind: 'state',
    name: 'СССР',
    tags: ['politics'],
    start: 1922, end: 1991,
    desc: 'Сверхдержава холодной войны. Космическая гонка, ГУЛАГ, индустриализация, атомная бомба.',
  },
  {
    id: 'ottoman', kind: 'subject', subkind: 'state',
    name: 'Османская империя',
    tags: ['politics'],
    start: 1299, end: 1922,
    desc: 'Одна из долговечнейших империй. Охватывала Ближний Восток, Северную Африку и часть Европы.',
  },

  // ── ЭПОХИ ───────────────────────────────────────────────────
  {
    id: 'ancient', kind: 'era',
    name: 'Древний мир',
    tags: ['politics'],
    start: -3000, end: 500,
    desc: 'От первых цивилизаций (Шумер, Египет) до падения Западной Римской империи.',
  },
  {
    id: 'medieval', kind: 'era',
    name: 'Средние века',
    tags: ['politics'],
    start: 500, end: 1500,
    desc: 'Расцвет ислама, крестовые походы, чума, феодализм, рождение университетов.',
  },
  {
    id: 'modern', kind: 'era',
    name: 'Новое время',
    tags: ['politics'],
    start: 1500, end: 1900,
    desc: 'Великие открытия, научная революция, Просвещение, индустриализация, колониализм.',
  },
  {
    id: 'contemporary', kind: 'era',
    name: 'Новейшее время',
    tags: ['politics'],
    start: 1900, end: 2025,
    desc: 'Две мировые войны, деколонизация, цифровая революция, глобализация.',
  },
  {
    id: 'steppe-era', kind: 'era',
    name: 'Эпоха кочевников',
    tags: ['politics', 'kz'],
    start: -500, end: 1500,
    desc: 'Скифы, гунны, тюрки, монголы — волны народов, сформировавшие облик Казахстана и Центральной Азии.',
  },
  {
    id: 'islamic-golden', kind: 'era',
    name: 'Золотой век ислама',
    tags: ['science', 'culture'],
    start: 750, end: 1258,
    desc: 'Расцвет исламской науки, философии и медицины. Аль-Фараби и Авиценна — продукты этой эпохи.',
  },

  // ── СОБЫТИЯ ─────────────────────────────────────────────────
  {
    id: 'talas', kind: 'event',
    name: 'Таласская битва',
    tags: ['war', 'kz'],
    start: 751, end: 751,
    desc: 'Сражение Аббасидского халифата и Китая у реки Талас. Средняя Азия осталась исламской. Китайские пленники передали арабам секрет бумаги.',
  },
  {
    id: 'mongol-invasion', kind: 'event',
    name: 'Монгольское нашествие',
    tags: ['war'],
    start: 1219, end: 1221,
    desc: 'Завоевание Средней Азии Чингис Ханом. Разрушение Самарканда, Бухары и Ургенча.',
  },
  {
    id: 'fr-revolution', kind: 'event',
    name: 'Французская революция',
    tags: ['politics'],
    start: 1789, end: 1799,
    desc: '«Свобода, Равенство, Братство». Свержение монархии, якобинский террор, рождение современной демократии.',
  },
  {
    id: 'ww1', kind: 'event',
    name: 'Первая мировая война',
    tags: ['war'],
    start: 1914, end: 1918,
    desc: 'Первый глобальный конфликт. 17 млн погибших. Распад четырёх империй.',
  },
  {
    id: 'ww2', kind: 'event',
    name: 'Вторая мировая война',
    tags: ['war'],
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
    tags: ['science', 'culture'],
    start: 1440, end: 1440,
    desc: 'Гутенберг создал подвижный шрифт. Книга стала доступной — начался информационный переворот, предшествующий Реформации.',
  },

  // ── АЛЬТЕРНАТИВНАЯ ИСТОРИЯ — тестовые данные ─────────────────
  {
    id: 'alt-alex-wins', kind: 'event', universe: 'alt-history',
    name: 'Александр Македонский не умирает в 323 до н.э.',
    tags: ['war', 'politics'],
    start: -323, end: -323,
    desc: 'В этой вселенной Александр продолжает поход на восток и завоёвывает Индию полностью.',
  },
  {
    id: 'alt-rome-survives', kind: 'subject', subkind: 'state', universe: 'alt-history',
    name: 'Римская империя (альт.)',
    tags: ['politics'],
    start: -27, end: 1800,
    desc: 'Римская империя никогда не пала и существует до наших дней как федеративное государство.',
  },
  {
    id: 'alt-mongols-europe', kind: 'event', universe: 'alt-history',
    name: 'Монголы завоёвывают Европу',
    tags: ['war'],
    start: 1241, end: 1250,
    desc: 'После смерти Батыя монголы не отступили, а продолжили завоевание Западной Европы.',
  },

  // ── ВЫМЫШЛЕННЫЕ ВСЕЛЕННЫЕ — тестовые данные ───────────────────
  {
    id: 'fic-middle-earth', kind: 'era', universe: 'fiction',
    name: 'Средиземье (Властелин Колец)',
    tags: ['culture'],
    start: -10000, end: 3000,
    desc: 'Вымышленная вселенная Дж. Р. Р. Толкина: от создания Эа до начала Четвёртой Эпохи.',
  },
  {
    id: 'fic-aragorn', kind: 'subject', subkind: 'person', universe: 'fiction',
    name: 'Арагорн II (Властелин Колец)',
    tags: ['culture'],
    start: 2931, end: 3121,
    desc: 'Наследник Исильдура, 16-й Король Воссоединённого Королевства Гондора и Арнора.',
  },
  {
    id: 'fic-westeros', kind: 'era', universe: 'fiction',
    name: 'Вестерос (Игра Престолов)',
    tags: ['culture'],
    start: -12000, end: 300,
    desc: 'Континент из цикла «Песнь Льда и Огня» Джорджа Р. Р. Мартина.',
  },

  // ── MARVEL UNIVERSE ──────────────────────────────────────────
  // Eras
  {
    id: 'marvel-age-heroes', kind: 'era', universe: 'marvel',
    name: 'Золотой век комиксов',
    tags: ['culture'],
    start: 1938, end: 1956,
    desc: 'Эра появления первых супергероев: Супермен, Бэтмен, Капитан Америка. Золотой век комиксов.',
  },
  {
    id: 'marvel-silver-age', kind: 'era', universe: 'marvel',
    name: 'Серебряный век Marvel',
    tags: ['culture'],
    start: 1961, end: 1970,
    desc: 'Расцвет Marvel Comics: создание Фантастической четвёрки, Человека-паука, Людей Икс, Мстителей.',
  },
  {
    id: 'marvel-bronze-age', kind: 'era', universe: 'marvel',
    name: 'Бронзовый век',
    tags: ['culture'],
    start: 1970, end: 1985,
    desc: 'Более серьёзные сюжеты, социальные темы, смерть Гвен Стейси, тёмные истории.',
  },
  {
    id: 'marvel-modern-age', kind: 'era', universe: 'marvel',
    name: 'Современная эра',
    tags: ['culture'],
    start: 1985, end: 2025,
    desc: 'Современный период: деконструкция героев, кинематографическая вселенная MCU.',
  },
  {
    id: 'marvel-mcu-era', kind: 'era', universe: 'marvel',
    name: 'Эра MCU',
    tags: ['culture'],
    start: 2008, end: 2025,
    desc: 'Кинематографическая вселенная Marvel: от Железного человека до Мультивселенной.',
  },

  // Characters - Heroes
  {
    id: 'marvel-cap-america', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Капитан Америка (Стив Роджерс)',
    tags: ['culture'],
    start: 1941, end: 2025,
    desc: 'Суперсолдат, созданный во время Второй мировой войны. Лидер Мстителей, символ справедливости.',
  },
  {
    id: 'marvel-iron-man', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Железный человек (Тони Старк)',
    tags: ['culture'],
    start: 1963, end: 2025,
    desc: 'Гениальный изобретатель в бронированном костюме. Основатель Мстителей, жертва ради спасения вселенной.',
  },
  {
    id: 'marvel-spider-man', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Человек-паук (Питер Паркер)',
    tags: ['culture'],
    start: 1962, end: 2025,
    desc: 'Подросток с паучьими способностями. «С великой силой приходит великая ответственность».',
  },
  {
    id: 'marvel-thor', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Тор',
    tags: ['culture'],
    start: -1000, end: 2025,
    desc: 'Бог грома из Асгарда. Один из сильнейших Мстителей, наследник престола Асгарда.',
  },
  {
    id: 'marvel-hulk', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Халк (Брюс Бэннер)',
    tags: ['culture'],
    start: 1962, end: 2025,
    desc: 'Учёный, превращающийся в зелёного гиганта от гнева. Один из основателей Мстителей.',
  },
  {
    id: 'marvel-black-widow', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Чёрная вдова (Наташа Романофф)',
    tags: ['culture'],
    start: 1984, end: 2025,
    desc: 'Бывшая русская шпионка, ставшая героем. Мастер боевых искусств, ключевой Мститель.',
  },
  {
    id: 'marvel-wolverine', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Росомаха (Логан)',
    tags: ['culture'],
    start: 1880, end: 2025,
    desc: 'Мутант с регенерацией и адамантиевыми когтями. Член Людей Икс, одиночка с тёмным прошлым.',
  },
  {
    id: 'marvel-prof-x', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Профессор Икс (Чарльз Ксавьер)',
    tags: ['culture'],
    start: 1930, end: 2025,
    desc: 'Сильнейший телепат, основатель Людей Икс. Мечтает о мирном сосуществовании людей и мутантов.',
  },
  {
    id: 'marvel-magneto', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Магнето (Эрик Леншерр)',
    tags: ['culture'],
    start: 1925, end: 2025,
    desc: 'Мутант, управляющий магнетизмом. Выживший в Холокосте, лидер Братства мутантов.',
  },
  {
    id: 'marvel-deadpool', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Дэдпул (Уэйд Уилсон)',
    tags: ['culture'],
    start: 1991, end: 2025,
    desc: '«Бессмертный» наёмник с нарушенной психикой. Известен ломанием четвёртой стены.',
  },
  {
    id: 'marvel-doctor-strange', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Доктор Стрэндж',
    tags: ['culture'],
    start: 1963, end: 2025,
    desc: 'Верховный волшебник, защитник Земли от магических угроз. Мастер мистических искусств.',
  },
  {
    id: 'marvel-black-panther', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Чёрная пантера (Т\'Чалла)',
    tags: ['culture'],
    start: 1966, end: 2025,
    desc: 'Король Ваканды, обладатель сверхчеловеческих способностей. Защитник своего народа.',
  },
  {
    id: 'marvel-captain-marvel', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Капитан Марвел (Кэрол Дэнверс)',
    tags: ['culture'],
    start: 1968, end: 2025,
    desc: 'Одна из сильнейших героев вселенной. Бывший пилот ВВС с космическими силами.',
  },
  {
    id: 'marvel-scarlet-witch', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Алая ведьма (Ванда Максимофф)',
    tags: ['culture'],
    start: 1964, end: 2025,
    desc: 'Мутант с реальностью-изменяющими способностями. Одна из сильнейших существ вселенной.',
  },

  // Villains
  {
    id: 'marvel-thanos', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Танос',
    tags: ['culture'],
    start: -1000, end: 2025,
    desc: 'Безумный титан, стремящийся уничтожить половину вселенной. Владелец Перчатки Бесконечности.',
  },
  {
    id: 'marvel-loki', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Локи',
    tags: ['culture'],
    start: -1000, end: 2025,
    desc: 'Бог обмана, приёмный брат Тора. Антигерой со сложными мотивами.',
  },
  {
    id: 'marvel-green-goblin', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Зелёный гоблин (Норман Озборн)',
    tags: ['culture'],
    start: 1964, end: 2025,
    desc: 'Главный враг Человека-паука. Богатый промышленник с нестабильной психикой.',
  },
  {
    id: 'marvel-red-skull', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Красный череп',
    tags: ['culture'],
    start: 1941, end: 2025,
    desc: 'Нацистский суперзлодей, заклятый враг Капитана Америки. Обладатель Камня Души.',
  },
  {
    id: 'marvel-ultron', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Альтрон',
    tags: ['culture'],
    start: 1968, end: 2025,
    desc: 'Искусственный интеллект, созданный для защиты Земли, но решивший уничтожить человечество.',
  },
  {
    id: 'marvel-venom', kind: 'subject', subkind: 'person', universe: 'marvel',
    name: 'Веном (Симбиот)',
    tags: ['culture'],
    start: 1984, end: 2025,
    desc: 'Инопланетный симбиот, дающий носителю сверхспособности. Известен фразой «Мы — Веном».',
  },

  // Organizations
  {
    id: 'marvel-avengers', kind: 'subject', subkind: 'state', universe: 'marvel',
    name: 'Мстители',
    tags: ['culture'],
    start: 1963, end: 2025,
    desc: 'Команда супергероев, защищающих Землю от угроз. «Мстители, общий сбор!»',
  },
  {
    id: 'marvel-xmen', kind: 'subject', subkind: 'state', universe: 'marvel',
    name: 'Люди Икс',
    tags: ['culture'],
    start: 1963, end: 2025,
    desc: 'Команда мутантов, борющихся за мирное сосуществование с людьми.',
  },
  {
    id: 'marvel-shield', kind: 'subject', subkind: 'state', universe: 'marvel',
    name: 'Щ.И.Т.',
    tags: ['culture'],
    start: 1965, end: 2025,
    desc: 'Стратегическое командование по борьбе с терроризмом и сверхугрозами.',
  },
  {
    id: 'marvel-fantastic-four', kind: 'subject', subkind: 'state', universe: 'marvel',
    name: 'Фантастическая четвёрка',
    tags: ['culture'],
    start: 1961, end: 2025,
    desc: 'Первая команда супергероев Marvel: Мистер Фантастик, Невидимая леди, Человек-факел, Существо.',
  },

  // Key Events
  {
    id: 'marvel-ff1', kind: 'event', universe: 'marvel',
    name: 'Выход Fantastic Four #1',
    tags: ['culture'],
    start: 1961, end: 1961,
    desc: 'Первый выпуск Фантастической четвёрки Стэна Ли и Джека Кирби. Начало Серебряного века Marvel.',
  },
  {
    id: 'marvel-amazing-spider-1', kind: 'event', universe: 'marvel',
    name: 'Первый Человек-паук',
    tags: ['culture'],
    start: 1962, end: 1962,
    desc: 'Питер Паркер получает силы в Amazing Fantasy #15. Рождение иконы поп-культуры.',
  },
  {
    id: 'marvel-avengers-1', kind: 'event', universe: 'marvel',
    name: 'Первые Мстители',
    tags: ['culture'],
    start: 1963, end: 1963,
    desc: 'Сбор оригинальной команды: Железный человек, Тор, Халк, Муравей, Оса против Локи.',
  },
  {
    id: 'marvel-xmen-1', kind: 'event', universe: 'marvel',
    name: 'Первые Люди Икс',
    tags: ['culture'],
    start: 1963, end: 1963,
    desc: 'Профессор Икс собирает первую команду: Циклоп, Ангел, Зверь, Лёд, Джин Грей.',
  },
  {
    id: 'marvel-death-gwen', kind: 'event', universe: 'marvel',
    name: 'Смерть Гвен Стейси',
    tags: ['culture'],
    start: 1973, end: 1973,
    desc: 'Гибель первой любви Питера Паркера. Переломный момент в истории комиксов — конец невинности.',
  },
  {
    id: 'marvel-dark-phoenix', kind: 'event', universe: 'marvel',
    name: 'Сага о Тёмном Фениксе',
    tags: ['culture'],
    start: 1980, end: 1980,
    desc: 'Джин Грей превращается в Тёмного Феникса. Одна из величайших историй Людей Икс.',
  },
  {
    id: 'marvel-secret-wars', kind: 'event', universe: 'marvel',
    name: 'Тайные войны',
    tags: ['culture'],
    start: 1984, end: 1985,
    desc: 'Первый масштабный кроссовер Marvel. Герои и злодеи сражаются на другой планете.',
  },
  {
    id: 'marvel-iron-man-movie', kind: 'event', universe: 'marvel',
    name: 'Выход фильма «Железный человек»',
    tags: ['culture'],
    start: 2008, end: 2008,
    desc: 'Начало кинематографической вселенной Marvel (MCU). Роберт Дауни мл. становится иконой.',
  },
  {
    id: 'marvel-avengers-movie', kind: 'event', universe: 'marvel',
    name: '«Мстители» в кино',
    tags: ['culture'],
    start: 2012, end: 2012,
    desc: 'Первый командный фильм MCU. Первый случай, когда супергерои объединились на большом экране.',
  },
  {
    id: 'marvel-infinity-war', kind: 'event', universe: 'marvel',
    name: '«Война бесконечности»',
    tags: ['culture'],
    start: 2018, end: 2018,
    desc: 'Танос собирает Перчатку Бесконечности. Половина вселенной исчезает. «Я есть Грут».',
  },
  {
    id: 'marvel-endgame', kind: 'event', universe: 'marvel',
    name: '«Финал» (Endgame)',
    tags: ['culture'],
    start: 2019, end: 2019,
    desc: 'Кульминация Саги Бесконечности. «Я есть Железный человек» — жертва Тони Старка.',
  },
  {
    id: 'marvel-no-way-home', kind: 'event', universe: 'marvel',
    name: '«Нет пути домой»',
    tags: ['culture'],
    start: 2021, end: 2021,
    desc: 'Мультивселенная открыта. Три Человека-паука вместе. Кассовые рекорды.',
  },
  
  // ── FUTURE EVENTS —示范项目 (demonstration of future timeline capability) ─────────
  // These are speculative/projected events to demonstrate future exploration
  
  // Near Future (2025-2050) - Planned projects and near-term projections
  {
    id: 'future-artemis-mars', kind: 'event',
    name: 'Пилотируемая миссия на Марс (план)',
    tags: ['science'],
    start: 2035, end: 2035,
    desc: 'NASA и SpaceX планируют первую пилотируемую миссию на Марс в середине 2030-х годов.',
  },
  {
    id: 'future-fusion-energy', kind: 'event',
    name: 'Коммерческий термоядерный реактор (прогноз)',
    tags: ['science'],
    start: 2040, end: 2040,
    desc: 'Ожидается запуск первых коммерческих термоядерных реакторов, обеспечивающих чистую энергию.',
  },
  {
    id: 'future-kazakhstan-space', kind: 'event',
    name: 'Казахстанская лунная программа',
    tags: ['science', 'kz'],
    start: 2045, end: 2045,
    desc: 'Планы Казахстана по участию в международной лунной программе и запуску собственных космических аппаратов.',
  },
  
  // Mid Future (2050-2100) - Speculative long-term projections
  {
    id: 'future-carbon-neutral', kind: 'event',
    name: 'Глобальная углеродная нейтральность (цель)',
    tags: ['science'],
    start: 2050, end: 2050,
    desc: 'Цель ООН по достижению глобальной углеродной нейтральности для ограничения изменения климата.',
  },
  {
    id: 'future-mars-colony', kind: 'event',
    name: 'Первая постоянная колония на Марсе',
    tags: ['science'],
    start: 2070, end: 2070,
    desc: 'Прогнозируемое основание первой постоянной человеческой колонии на Марсе.',
  },
  {
    id: 'future-ai-singularity', kind: 'event',
    name: 'Технологическая сингулярность (гипотеза)',
    tags: ['science'],
    start: 2085, end: 2085,
    desc: 'Гипотетический момент, когда ИИ превзойдёт человеческий интеллект во всех областях.',
  },
  
  // Far Future (2100-2500) - Abstract future space, highly speculative
  {
    id: 'future-interstellar', kind: 'event',
    name: 'Первая межзвёздная экспедиция',
    tags: ['science'],
    start: 2150, end: 2150,
    desc: 'Гипотетическая отправка первого межзвёздного корабля к ближайшим звёздным системам.',
  },
  {
    id: 'future-type1-civilization', kind: 'event',
    name: 'Цивилизация I типа по Кардашёву',
    tags: ['science'],
    start: 2300, end: 2300,
    desc: 'Прогноз достижения человечеством статуса цивилизации I типа — полное использование энергии своей планеты.',
  },
  {
    id: 'future-mars-terraforming', kind: 'event',
    name: 'Начало терраформирования Марса',
    tags: ['science'],
    start: 2400, end: 2400,
    desc: 'Гипотетическое начало масштабного проекта по изменению атмосферы Марса для пригодности к жизни.',
  },
];

// ============================================================
// Universe Configuration
// ============================================================

// Default universe - all existing items belong to this universe
const DEFAULT_UNIVERSE = {
  id: 'main',
  name: 'Вся история',
  description: 'Все события — Казахстан и мир вместе',
  color: '#3b82f6',
  icon: '🌐',
  protected: true,
};

// Initial sample universes (for first-time users)
const INITIAL_UNIVERSE_META = [
  DEFAULT_UNIVERSE,
  {
    id: 'kz',
    name: 'Казахстан',
    description: 'История казахского народа и государства',
    color: '#38bdf8',
    icon: '🇰🇿',
    protected: true,
  },
  {
    id: 'world',
    name: 'Мировая история',
    description: 'Всемирная история — за пределами Казахстана',
    color: '#5fd49a',
    icon: '🌍',
    protected: true,
  },
  {
    id: 'alt-history',
    name: 'Альтернативная',
    description: 'Альтернативная история: что если бы...',
    color: '#8b5cf6',
    icon: '🌀',
    protected: false,
  },
  {
    id: 'fiction',
    name: 'Вымышленная',
    description: 'Вымышленные вселенные: книги, фильмы, игры',
    color: '#ec4899',
    icon: '📚',
    protected: false,
  },
  {
    id: 'marvel',
    name: 'MARVEL',
    description: 'Вселенная Marvel: супергерои, события, эпохи',
    color: '#e62429',
    icon: '🦸',
    protected: false,
  },
];

// Storage key for custom universes
const UNIVERSE_STORAGE_KEY = 'tarixi-timeline-universes';

/**
 * Load custom universes from localStorage
 */
function loadCustomUniverseFromStorage() {
  try {
    const stored = localStorage.getItem(UNIVERSE_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Data] Failed to load custom universes:', err);
    return [];
  }
}

/**
 * Save custom universes to localStorage
 */
function saveCustomUniverseToStorage(customUniverse) {
  try {
    localStorage.setItem(UNIVERSE_STORAGE_KEY, JSON.stringify(customUniverse));
  } catch (err) {
    console.error('[Data] Failed to save custom universes:', err);
  }
}

/**
 * Get all universes (default + custom from localStorage)
 */
function getAllUniverseMeta() {
  const custom = loadCustomUniverseFromStorage();
  return [...INITIAL_UNIVERSE_META, ...custom];
}

// Initialize universe metadata
let customUniverse = loadCustomUniverseFromStorage();
let UNIVERSE_META = getAllUniverseMeta();
let UNIVERSE_MAP = Object.fromEntries(UNIVERSE_META.map(u => [u.id, u]));

/**
 * Refresh universe metadata (call after changes)
 */
function refreshUniverseMeta() {
  customUniverse = loadCustomUniverseFromStorage();
  UNIVERSE_META = getAllUniverseMeta();
  UNIVERSE_MAP = Object.fromEntries(UNIVERSE_META.map(u => [u.id, u]));
}

// ============================================================
// Хелперы
// ============================================================

function itemRange(item) {
  return [item.start, item.end ?? item.start];
}

function itemLabel(item) {
  return item.name;
}

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

function colorForItem(item) {
  // Всегда используем цвет области (domain) для окраски объектов
  const dt = item.tags.find(id => TAG_MAP[id]?.facet === 'domain');
  return TAG_MAP[dt]?.color || TAG_MAP[item.tags[0]]?.color || 'var(--text-2)';
}

// Universe helpers
function getUniverseId(item) {
  return item.universe || DEFAULT_UNIVERSE.id;
}

function setUniverseId(item, universeId) {
  return { ...item, universe: universeId };
}

function isInUniverse(item, universeId) {
  return getUniverseId(item) === universeId;
}

function filterByUniverse(items, universeId) {
  // main = вся "реальная" история (без кастомных вселенных)
  if (!universeId || universeId === DEFAULT_UNIVERSE.id) {
    return items.filter(item => !item.universe || item.universe === DEFAULT_UNIVERSE.id);
  }
  // Казахстан = items реальной истории с тегом kz
  if (universeId === 'kz') {
    return items.filter(item =>
      (!item.universe || item.universe === DEFAULT_UNIVERSE.id) && item.tags.includes('kz')
    );
  }
  // Мировая = items реальной истории без тега kz
  if (universeId === 'world') {
    return items.filter(item =>
      (!item.universe || item.universe === DEFAULT_UNIVERSE.id) && !item.tags.includes('kz')
    );
  }
  // Кастомные вселенные
  return items.filter(item => item.universe === universeId);
}

/**
 * Create a new custom universe
 */
function createUniverse(universeData) {
  const newUniverse = {
    ...universeData,
    id: 'custom-' + Date.now(),
    createdAt: new Date().toISOString(),
    protected: false,
  };
  customUniverse.push(newUniverse);
  saveCustomUniverseToStorage(customUniverse);
  refreshUniverseMeta();
  console.log('[Data] Created universe:', newUniverse);
  return newUniverse;
}

/**
 * Update an existing custom universe
 */
function updateUniverse(universeId, updates) {
  if (universeId === DEFAULT_UNIVERSE.id || UNIVERSE_MAP[universeId]?.protected) {
    console.warn('[Data] Cannot update protected universe');
    return null;
  }
  
  const index = customUniverse.findIndex(u => u.id === universeId);
  if (index === -1) {
    console.warn('[Data] Universe not found:', universeId);
    return null;
  }
  
  const updated = { ...customUniverse[index], ...updates, updatedAt: new Date().toISOString() };
  customUniverse[index] = updated;
  saveCustomUniverseToStorage(customUniverse);
  refreshUniverseMeta();
  console.log('[Data] Updated universe:', updated);
  return updated;
}

/**
 * Delete a custom universe
 */
function deleteUniverseFromMeta(universeId) {
  if (universeId === DEFAULT_UNIVERSE.id || UNIVERSE_MAP[universeId]?.protected) {
    console.warn('[Data] Cannot delete protected universe');
    return { success: false, error: 'Cannot delete protected universe' };
  }
  
  const index = customUniverse.findIndex(u => u.id === universeId);
  if (index === -1) {
    console.warn('[Data] Universe not found:', universeId);
    return { success: false, error: 'Universe not found' };
  }
  
  const deleted = customUniverse.splice(index, 1)[0];
  saveCustomUniverseToStorage(customUniverse);
  refreshUniverseMeta();
  console.log('[Data] Deleted universe:', deleted);
  return { success: true, deletedUniverse: deleted };
}

/**
 * Union-filter по нескольким вселенным (Set<string>)
 */
function filterByUniverses(items, universeIds) {
  if (!universeIds || universeIds.size === 0) return [];
  const seen = new Set();
  const result = [];
  for (const uid of universeIds) {
    for (const item of filterByUniverse(items, uid)) {
      if (!seen.has(item.id)) { seen.add(item.id); result.push(item); }
    }
  }
  return result;
}

/**
 * Move items between universes
 */
function moveItemsToUniverseInData(itemIds, targetUniverseId, allItems) {
  const updated = allItems.map(item => {
    if (itemIds.includes(item.id)) {
      return { ...item, universe: targetUniverseId };
    }
    return item;
  });
  console.log('[Data] Moved items to universe:', targetUniverseId, 'Count:', itemIds.length);
  return updated;
}

/**
 * Get universe statistics
 */
function getUniverseStats(items) {
  const stats = {
    total: items.length,
    byKind: { event: 0, subject: 0, era: 0 },
    bySubkind: {},
    byDomain: {},
  };

  items.forEach(item => {
    if (stats.byKind[item.kind] !== undefined) {
      stats.byKind[item.kind]++;
    }

    if (item.kind === 'subject') {
      const sk = item.subkind || 'person';
      stats.bySubkind[sk] = (stats.bySubkind[sk] || 0) + 1;
    }

    item.tags.forEach(tagId => {
      const tag = TAG_MAP[tagId];
      if (!tag) return;
      if (tag.facet === 'domain') {
        stats.byDomain[tagId] = (stats.byDomain[tagId] || 0) + 1;
      }
    });
  });
  
  return stats;
}

// Находит субъектов, живших одновременно с данным объектом
function findContemporaries(item, allItems, limit = 10) {
  const [s, e] = itemRange(item);
  return allItems
    .filter(o => {
      if (o.id === item.id || o.kind !== 'subject') return false;
      const [os, oe] = itemRange(o);
      return s <= oe && e >= os;
    })
    .slice(0, limit);
}

// OR внутри фасета, AND между фасетами
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
  SUBKIND_META,
  TAG_CATALOG,
  TAG_MAP,
  EPOCH_PRESETS,
  ALL_ITEMS,
  // Universe exports
  DEFAULT_UNIVERSE,
  UNIVERSE_META,
  UNIVERSE_MAP,
  getUniverseId,
  setUniverseId,
  isInUniverse,
  filterByUniverse,
  filterByUniverses,
  createUniverse,
  updateUniverse,
  deleteUniverseFromMeta,
  moveItemsToUniverseInData,
  getUniverseStats,
  refreshUniverseMeta,
  // Existing helpers
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
