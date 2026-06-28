/* TarixiTimeline — простая i18n.
   Казахский по умолчанию; переключатель KZ/RU/EN.
   UI-строки — здесь. Контент (имена/описания) хранится на казахском в data.jsx. */

const I18N = {
  // язык
  langName: { kz: 'Қазақша', ru: 'Русский', en: 'English' },

  // шапка
  brandTagline: { kz: 'тарих навигаторы', ru: 'навигатор истории', en: 'history navigator' },
  searchPlaceholder: { kz: 'Тұлға, оқиға, кезеңді табу…', ru: 'Найти личность, событие, эпоху…', en: 'Find a person, event, era…' },
  add: { kz: 'Қосу', ru: 'Добавить', en: 'Add' },
  allHistory: { kz: 'Бүкіл тарих', ru: 'Вся история', en: 'All history' },
  collectionsN: { kz: 'жинақ', ru: 'коллекции', en: 'collections' },

  // легенда
  objectType: { kz: 'Нысан түрі', ru: 'Тип объекта', en: 'Object type' },
  tags: { kz: 'Тегтер', ru: 'Теги', en: 'Tags' },
  'kind.subject': { kz: 'Қатысушылар', ru: 'Участники', en: 'People' },
  'kind.event': { kz: 'Оқиғалар', ru: 'События', en: 'Events' },
  'kind.era': { kz: 'Кезеңдер', ru: 'Периоды', en: 'Periods' },
  addTag: { kz: 'тег', ru: 'тег', en: 'tag' },
  tagNamePlaceholder: { kz: 'Атауы', ru: 'Название', en: 'Name' },
  cancel: { kz: 'Болдырмау', ru: 'Отмена', en: 'Cancel' },
  create: { kz: 'Құру', ru: 'Создать', en: 'Create' },
  objectsInBase: { kz: 'Базадағы нысандар', ru: 'Объектов в базе', en: 'Objects in base' },

  // детальная панель
  description: { kz: 'Сипаттама', ru: 'Описание', en: 'Description' },
  talk: { kz: 'Сөйлесу', ru: 'Поговорить', en: 'Talk' },
  edit: { kz: 'Өңдеу', ru: 'Редактировать', en: 'Edit' },
  contemporaries: { kz: 'Замандастары', ru: 'Современники', en: 'Contemporaries' },
  duringLife: { kz: 'Өмір сүрген кезінде', ru: 'При его жизни', en: 'During their lifetime' },
  lifeYears: { kz: 'Өмір жылдары', ru: 'Годы жизни', en: 'Life years' },
  yearLabel: { kz: 'Жыл', ru: 'Год', en: 'Year' },
  periodLabel: { kz: 'Кезең', ru: 'Период', en: 'Period' },
  duration: { kz: 'Ұзақтығы', ru: 'Длительность', en: 'Duration' },
  yearsUnit: { kz: 'жыл', ru: 'лет', en: 'yrs' },
  noContemporaries: { kz: 'Біздің базада жылдары бойынша қиылысатын ешкім жоқ', ru: 'Никто не пересекается по годам в нашем датасете', en: 'No one overlaps by years in our dataset' },
  regionKz: { kz: 'Қазақстан', ru: 'Казахстан', en: 'Kazakhstan' },
  regionWorld: { kz: 'Әлем', ru: 'Мир', en: 'World' },
  close: { kz: 'Жабу', ru: 'Закрыть', en: 'Close' },

  // чат
  chatSubtitle: { kz: 'ЖИ-сұхбат', ru: 'диалог с ИИ', en: 'AI dialogue' },
  chatWriteTo: { kz: 'Жаз: {name}…', ru: 'Напиши {name}…', en: 'Write to {name}…' },
  chatEmptyHint: { kz: '{name} бірінші жақтан жауап береді — сұрақ қой.', ru: 'Задай вопрос — {name} ответит от первого лица.', en: 'Ask a question — {name} answers in first person.' },
  chatSug1: { kz: 'Өзің туралы айтшы', ru: 'Расскажи о себе', en: 'Tell me about yourself' },
  chatSug2: { kz: 'Немен әйгілісің?', ru: 'Чем ты известен?', en: 'What are you known for?' },
  chatSug3: { kz: 'Дәуірің қандай болды?', ru: 'Какой была твоя эпоха?', en: 'What was your era like?' },
  chatNeedKey: { kz: '{prov} тегін кілті қажет', ru: 'Нужен бесплатный ключ {prov}', en: 'Free {prov} key required' },
  chatKeyHint: { kz: 'MVP режимі: кілт тек браузеріңде сақталады. Тегін кілтті {link} алып, осында қой.', ru: 'MVP-режим: ключ хранится только в твоём браузере. Получи бесплатный ключ на {link} и вставь сюда.', en: 'MVP mode: the key is stored only in your browser. Get a free key at {link} and paste it here.' },
  chatSaveKey: { kz: 'Кілтті сақтау', ru: 'Сохранить ключ', en: 'Save key' },
  chatBadKey: { kz: 'Кілт жарамсыз — басқасын байқап көр.', ru: 'Ключ недействителен — попробуй другой.', en: 'Invalid key — try another.' },
  chatError: { kz: 'Жауап алу мүмкін болмады', ru: 'Не удалось получить ответ', en: 'Failed to get a response' },
};

window.I18N = I18N;
window.LANG = localStorage.getItem('tarixi-lang') || 'kz';
window.LANGS = ['kz', 'ru', 'en'];

// t('key', {name:'...'}) → строка на текущем языке (фоллбэк: kz → key)
window.t = function (key, vars) {
  const e = I18N[key];
  let s = e ? (e[window.LANG] || e.kz || key) : key;
  if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
  return s;
};
window.setLang = function (lang) {
  window.LANG = lang;
  try { localStorage.setItem('tarixi-lang', lang); } catch (_) {}
};
