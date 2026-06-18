# TarixiTimeline — Agent Instructions

> Читается автоматически Claude Code и любым AI-агентом перед началом работы.
> GitHub: https://github.com/bekarazhan/tarixi-timeline
> Запуск: `python3 -m http.server 7788` → http://localhost:7788

---

## Что это за проект

Визуальный навигатор по истории для студентов — интерактивный таймлайн, где видно кто жил одновременно, что происходило в разных регионах, как эпохи пересекаются. Целевая аудитория: школьники и студенты Казахстана.

**Текущий статус: MVP** — всё в браузере без сборщика, без бэкенда.

---

## Стек и архитектура

- **Frontend**: React 18 + Babel standalone (JSX через `type="text/babel"`)
- **Никакого бандлера** — файлы подключаются напрямую в `index.html`
- **Нет TypeScript** — чистый JS
- **Нет бэкенда** — данные в `data.jsx`, персистентность через `localStorage`

### Файловая структура

```
index.html          — точка входа, подключает все JSX-файлы через <script type="text/babel">
data.jsx            — данные + хелперы (TAG_CATALOG, ALL_ITEMS, SUBKIND_META, EPOCH_PRESETS)
app.jsx             — корневой App, вся state-логика
legend.jsx          — левая панель фильтрации
timeline.jsx        — основной холст + Minimap
detail.jsx          — правая панель деталей при клике на объект
tweaks-panel.jsx    — скрытая панель настроек (шкала, плотность, мини-карта)
styles.css          — все стили
PROJECT_STATE.md    — текущий снапшот состояния проекта (обновлять после крупных изменений)
WORK_LOG.md         — журнал сессий (только дописывать, не перезаписывать)
CLAUDE.md           — этот файл
```

---

## Модель данных

### Три вида объектов (`kind`)

| kind | Визуал | Описание |
|---|---|---|
| `event` | Ромб-точка | Момент или краткое событие |
| `subject` | Полоска с точками на концах | Конкретная сущность с жизненным циклом |
| `era` | Широкая фоновая полоса | Абстрактный временной контекст |

### Подтипы субъектов (`subkind`)

- `person` — 👤 Люди
- `people` — 👥 Народности
- `state`  — 🏛 Государства
- `city`   — 🏙 Города
- *пользователь может добавить свои*

### Теги — два фасета

- **domain**: `politics / war / science / culture / religion / economy`
- **place**: `kz / asia / mideast / europe / america / africa / global`

Первый domain-тег → основной цвет заливки.  
Первый place-тег → цвет вторичных элементов (точки, кольца).

### Пример объекта

```js
{
  id: 'al-farabi',
  kind: 'subject',
  subkind: 'person',
  name: 'Аль-Фараби',
  tags: ['science', 'kz'],
  start: 872, end: 950,
  lifeSpan: '872 — 950',
  desc: 'Средневековый учёный...',
}
```

---

## State в App

```js
activeTags      // Set<tagId> — какие теги включены
activeKinds     // Set<'subject'|'event'|'era'>
activeSubkinds  // Set<'person'|'people'|'state'|...>
customTags      // [{id, name, facet, color}] — пользовательские теги
customSubkinds  // [{id, label, icon}] — пользовательские подтипы
items           // весь массив объектов (включая добавленные юзером)
view            // {start, end} — текущее окно таймлайна
selected        // выбранный объект
```

---

## Глобальные хелперы (`window.*`)

```js
window.colorForItem(item, 'primary')   // domain → цвет
window.colorForItem(item, 'place')     // place → цвет
window.itemRegion(item)                // 'kz' или 'world'
window.isItemVisible(item, activeTags) // OR внутри фасета, AND между фасетами
window.findContemporaries(item, items) // кто жил одновременно
window.TAG_MAP                         // {tagId → tag}
window.SUBKIND_META                    // {subkind → {label, icon}}
window.EPOCH_PRESETS                   // [{id, name, start, end, color}]
```

---

## Конвенции и ограничения

- **Не вводить бандлер** без явного решения владельца проекта
- **Не добавлять TypeScript** на MVP-стадии
- **Не трогать визуальный язык** (dual-color encoding) без обсуждения — это ключевая фича
- Стили только в `styles.css`, не inline
- ID объектов — kebab-case на латинице: `'genghis-khan'`, `'golden-horde'`
- Теги только из TAG_CATALOG (или добавлять туда перед использованием)

---

## Треки на таймлайне

```
Трек 0 (выше оси)  → события (event)
Трек 1 (выше оси)  → субъекты (subject)
Трек 2 (выше оси)  → эпохи (era)

items с тегом 'kz' → верхняя зона КАЗАХСТАН
остальные          → нижняя зона ВСЕМИРНАЯ ИСТОРИЯ
```

---

## Протокол работы агента

1. **Перед началом** — прочитать `WORK_LOG.md` (последние 2-3 записи) чтобы понять что менялось
2. **Во время работы** — не ломать визуальный язык и модель данных
3. **После завершения** — добавить запись в `WORK_LOG.md` в формате:

```
## [YYYY-MM-DD] Агент: <имя> | Сессия: <тема>

### Что сделано
- ...

### Что изменилось в файлах
- `file.jsx` — ...

### Причина / контекст
...

### Следующие шаги
- ...
```

4. **При крупных изменениях модели данных или архитектуры** — обновить `PROJECT_STATE.md`
