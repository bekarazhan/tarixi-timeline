# TarixiTimeline — Project State

> Контекст для продолжения работы в новой сессии.
> GitHub: https://github.com/bekarazhan/tarixi-timeline
> Сервер: `python3 -m http.server 7788` → http://localhost:7788

---

## Что это

Визуальный навигатор по истории для студентов — интерактивный таймлайн где видно кто жил одновременно, что происходило в разных регионах, как эпохи пересекаются. Стек: React 18 + Babel standalone (JSX через `type="text/babel"`), никакого сборщика.

---

## Файловая структура

```
index.html        — точка входа, подключает все JSX
data.jsx          — данные + хелперы (TAG_CATALOG, ALL_ITEMS, SUBKIND_META, EPOCH_PRESETS)
legend.jsx        — левая панель фильтрации
timeline.jsx      — основной холст + Minimap
app.jsx           — корневой App, вся state-логика
detail.jsx        — правая панель деталей при клике на объект
tweaks-panel.jsx  — скрытая панель настроек (шкала, плотность, мини-карта)
styles.css        — все стили
```

---

## Модель данных (финальная)

### Три структурных вида объектов (`kind`)

| kind | Визуал | Описание |
|---|---|---|
| `event` | Ромб-точка | Момент или краткое событие |
| `subject` | Полоска с точками на концах | Конкретная сущность с жизненным циклом |
| `era` | Широкая фоновая полоса | Абстрактный временной контекст |

### Подтипы субъектов (`subkind`)

Определён в `SUBKIND_META` (расширяемо пользователем):
- `person` — 👤 Люди
- `people` — 👥 Народности  
- `state`  — 🏛 Государства
- `city`   — 🏙 Города
- *пользователь может добавить свои через кнопку «+ подтип» в Legend*

### Два фасета тегов (`tags[]`)

- **domain** (Область): `politics / war / science / culture / religion / economy`
- **place** (Место): `kz / asia / mideast / europe / america / africa / global`

Первый domain-тег → основной цвет заливки.
Первый place-тег → цвет вторичных элементов (точки, кольца, акценты).

### Пример объекта

```js
{
  id: 'al-farabi',
  kind: 'subject',
  subkind: 'person',
  name: 'Аль-Фараби',
  tags: ['science', 'kz'],        // domain + place
  start: 872, end: 950,
  lifeSpan: '872 — 950',
  desc: 'Средневековый учёный...',
}
```

---

## Визуальный язык (цвета)

Два измерения одновременно без переключателей:

| Элемент | Что кодирует |
|---|---|
| Заливка бара / ромба | **Область** (domain) |
| Крайние точки субъекта | **Место** (place) |
| Кольцо вокруг события | **Место** (place) |
| Левый акцент эпохи | **Место** (place) |

Расшифровка видна прямо в Legend: `—— заливка = область  ● точки = место`

---

## Legend (левая панель)

Снизу вверх по логике:

1. **Тип объекта** — тоглы для `subject / event / era`
   - Под «Субъекты» — подтипы с индивидуальными тоглами (👤 Люди, 🏛 Государства...)
   - Кнопка **«+ подтип»** — инлайн-форма: emoji + название
2. **Область** — тоглы domain-тегов + **«+ тег»** (Google Calendar style)
3. **Место** — тоглы place-тегов + **«+ тег»**
4. Футер: счётчик объектов

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

## Важные хелперы (window.*)

```js
window.colorForItem(item, 'primary')  // первый domain-тег → цвет
window.colorForItem(item, 'place')    // первый place-тег → цвет
window.itemRegion(item)               // 'kz' если есть тег kz, иначе 'world'
window.isItemVisible(item, activeTags) // OR внутри фасета, AND между фасетами
window.findContemporaries(item, allItems) // кто жил одновременно (kind === 'subject')
window.TAG_MAP                        // {tagId → tag}
window.SUBKIND_META                   // {subkind → {label, icon}}
window.EPOCH_PRESETS                  // [{id, name, start, end, color}]
```

---

## Треки на таймлайне

```
Трек 0 (выше оси)  → события (event)
Трек 1 (выше оси)  → субъекты (subject)
Трек 2 (выше оси)  → эпохи (era)

Разделение: items с тегом 'kz' → верхняя зона КАЗАХСТАН
            остальные         → нижняя зона ВСЕМИРНАЯ ИСТОРИЯ
```

---

## Git история (последние коммиты)

```
8c305c2  feat: dual-color encoding — domain fills, place accents
f87af40  ux: move colorBy control to Legend, remove from TweaksPanel
ff55a41  feat: subkind toggle + add in Legend
318f941  refactor: event/subject/era model replaces event/person/period
26b3f9c  ux: inline tag creator in Legend, remove epoch shortcuts + footer hint
f6c7f37  refactor: 2-facet tag system (domain/place) + kind filter in Legend
9cf78d6  Initial commit
```

---

## Возможные следующие шаги

- **Добавить народности/города в данные** — сейчас только люди и государства
- **Detail panel** — показывать современников (findContemporaries) в правой панели
- **Связи между объектами** — визуальные линии «учитель→ученик», «основатель→государство»
- **Поиск** — расширить HeaderSearch (сейчас работает только по name)
- **Онбординг** — подсказки для новых пользователей что и как
- **Мобильная версия** — сейчас только десктоп
- **Персистентность** — сохранение пользовательских объектов/тегов в localStorage
