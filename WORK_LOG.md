# Work Log — TarixiTimeline

> Append-only журнал сессий. Только дописывать новые записи в начало.
> Каждый AI-агент добавляет запись после завершения работы.
> Формат: дата + агент + что сделано + что изменилось + следующие шаги.

---

## [2026-06-21] Агент: Claude Code | Сессия: Фото-тултипы, импорт/экспорт коллекций

### Что сделано
- **Фото-тултипы**: при наведении на объект с `photoUrl` тултип расширяется и показывает фото (120px). Следует за курсором, умный flip у края вьюпорта. Объекты без фото — старый компактный тултип
- **Фикс URL изображений**: `upload.wikimedia.org` блокирует запросы с localhost → переведены все `photoUrl` на `commons.wikimedia.org/wiki/Special:FilePath/<file>?width=800`
- **Тестовые фото**: abay, chinggis, avicenna, leonardo, napoleon, talas (+ al-farabi ранее)
- **Импорт коллекций по JSON** (концепт для будущего community-хаба):
  - `ImportCollectionModal` — вкладки «Вставить JSON» / «По URL», live-валидация, превью, кнопка «Пример схемы», подсказка про генерацию через ChatGPT/Claude
  - `validateCollection()` — проверка обязательных полей (name, items[], id/kind/name/start)
  - `handleImportCollection` в App: создаёт кастомную вселенную + добавляет items с префиксом id, активирует коллекцию
- **Экспорт коллекции**: кнопка-иконка на кастомных коллекциях → скачивает `<id>.json` (items без служебного поля universe)

### Что изменилось в файлах
- `data.jsx` (v35) — photoUrl у 7 объектов
- `timeline.jsx` (v36) — фото-блок в тултипе, тултип следует за курсором, edge-flip
- `universe-manager.jsx` (v30) — ImportCollectionModal, SCHEMA_EXAMPLE, validateCollection, exportUniverseAsJSON, кнопки импорта/экспорта
- `app.jsx` (v37) — handleImportCollection, проброс onImportCollection через UniverseSelector
- `styles.css` (v35) — стили import-modal, фото-тултип, universe-action-row, кнопка export
- `index.html` — версии

### Коммиты
- `ec0f024` — photo tooltips on hover + fix Wikimedia image URLs
- `b1d4d3b` — clean up stale docs, prototypes, test files

### Концепция импорта коллекций (для бэка)
Цель: пользователь добавляет коллекцию (напр. Assassin's Creed) в разрезе реальной истории, не вбивая каждого персонажа вручную. Сейчас прото на localStorage. Дальше:
- Community-хаб: статичная папка `community/` в репо (`index.json` + `<collection>.json`), фетч с GitHub CDN без бэка
- Вкладка «Обзор» с галереей community-коллекций
- Сабмит своей коллекции в комьюнити (через бэк)

### Следующие шаги
- Community-хаб (галерея готовых коллекций)
- Пустое состояние таймлайна
- Поиск: "эпоху" → "период" в placeholder
- Проверить `findContemporaries` в Detail panel

---

## [2026-06-19] Агент: Claude Code | Сессия: UX-фиксы, фото, коллекции, навигация

### Что сделано
- **Цвет при фильтрации**: `colorForItem(item, activeTags)` — цвет берётся от первого активного тега, а не от первого тега вообще
- **Эпохи без тега политика**: ancient/medieval/modern/contemporary/steppe-era очищены от некорректного `politics`-тега (был назначен Python-скриптом как fallback для global)
- **Тачпад — навигация назад**: React onWheel пассивный с v17 → заменён на DOM `addEventListener({ passive: false })` + `overscroll-behavior: none` на `.tl-stage`
- **Минимап-баг**: `onMouseMove` не обновлял `lastX` → окошко бежало быстрее мыши. Фикс: `dragRef.current.lastX = e.clientX`
- **Закрытие панели кликом**: `onPointerUp` проверяет движение < 5px → `onSelect(null)`. Фикс `null.kind` через `item?.kind`
- **Коллекция в форме создания**: селектор коллекции (пилюли) в CreateModal/EditModal, дефолт = единственная активная коллекция
- **Фото**: поле URL в форме, отображение как 160px-полоса над hero в DetailPanel, скрывается при ошибке загрузки
- **Главный тег**: первый чип в TagInput выделен `border-left` в цвет тега
- **Модал редактирования**: CreateModal с `initialItem` для edit-режима, кнопка "Редактировать" в DetailPanel

### Коммиты
- `904f73e` — colorForItem respects active filters
- `3fe6888` — remove incorrect politics tag from world eras
- `de93e72` — prevent browser back/forward on trackpad swipe
- `9b3bf1e` — minimap drag offset + close panel on empty click
- `6698079` — null check in handleSelectAndZoom
- `e8c17ec` — collection selector in create/edit modal
- `0460a36` — photo field for events and persons

### Следующие шаги
- Пустое состояние таймлайна
- Новый объект в активной коллекции (сейчас есть дефолт, но можно улучшить)
- Проверить `findContemporaries` в Detail panel
- Поиск: "эпоху" → "период" в placeholder

---

## [2026-06-19] Агент: Claude Code | Сессия: Удаление субкиндов, #-инпут тегов

### Что сделано
- Субкинды (person/people/state/city) превращены в обычные теги в TAG_CATALOG
- Python-скрипт: поле `subkind: 'X'` удалено из всех items, `'X'` добавлен в конец `tags: [...]`
- Удалены `SUBKIND_META`, `SubkindCreator`, секция субкиндов из Legend
- Удалены `activeSubkinds`/`customSubkinds` стейт и хендлеры из App
- Удалена фильтрация по субкинду из Timeline и Minimap
- `CreateModal`: убран селектор подтипа, тег-кнопки заменены на `TagInput`
- `TagInput` — новый компонент: `#`-prefix, автокомплит из TAG_CATALOG, чипы с ×, Backspace удаляет последний, Enter выбирает первый матч или создаёт новый тег

### Что изменилось в файлах
- `data.jsx` — удалён SUBKIND_META, добавлены entity-теги в TAG_CATALOG, 54 items обновлены
- `legend.jsx` — удалена SubkindCreator и весь subkind-блок
- `app.jsx` — InlineTagCreator → TagInput, упрощён CreateModal, убраны subkind-стейты
- `timeline.jsx` — убраны activeSubkinds из Timeline и Minimap
- `styles.css` — CSS для TagInput (chip, dropdown, autocomplete)
- `index.html` — версии v32

### Коммиты
- `6532280` — refactor: replace subkinds with tags, add #-input with autocomplete

### Следующие шаги
- Пустое состояние таймлайна
- Новый объект в активной коллекции, не в main
- Проверить `findContemporaries` в Detail panel
- Поиск: "эпоху" → "период" в placeholder

---

## [2026-06-19] Агент: Claude Code | Сессия: Цветовая система, удаление Place-тегов

### Что сделано
- Цветовая система: Place-теги переведены в приглушённую «картографическую» гамму (не конкурируют с яркими Domain-тегами)
- Kind-индикаторы в Legend переработаны в shape-иконки: Участники = линия с точками, События = кружок, Периоды = плоский bar с левой чертой
- Полное удаление Place-фасета: убран из FACETS, TAG_CATALOG, всех items (77 замен), Legend, формы создания, поиска
- `kz`-тег сохранён в items как внутренний маркер коллекции, не виден пользователю
- Форма создания: убрано обязательное требование тега места, теги теперь в один ряд
- Legend: секция "Место" удалена, "Область" переименована в "Теги"

### Что изменилось в файлах
- `data.jsx` — удалён `place` из FACETS, удалены place-теги из TAG_CATALOG, 77 замен в items, убрано `byPlace` из computeStats
- `legend.jsx` — shape kind-индикаторы, удалена секция Место, "Область" → "Теги"
- `app.jsx` — упрощён `byFacet` → flat `domainTags`, убрана валидация place-тега, упрощён поиск
- `styles.css` — CSS для shape kind-индикаторов (kind-subject, kind-event, kind-era)
- `index.html` — версии data v31, legend v31, app v31, styles v28

### Коммиты
- `150c864` — design: color system — muted place tags, shape-based kind indicators
- `a6832d7` — refactor: remove Place tag facet, simplify to single tag dimension

### Следующие шаги
- Пустое состояние таймлайна (когда ничего не видно)
- Новый объект создавать в активной коллекции, не всегда в `main`
- Поиск: плейсхолдер "эпоху" → "период"
- Проверить `findContemporaries` в Detail panel

---

## [2026-06-19] Агент: Claude Code | Сессия: Multi-select вселенных, UX-терминология, фикс модалов

### Что сделано
- Завершён multi-select вселенных: `activeUniverses: Set<string>` вместо `currentUniverse: string`
- Исправлено тело `UniverseManagerPanel` (старые `currentUniverse`/`onSwitch` → `activeUniverses`/`onToggle`)
- `filterByUniverses()` — union-dedup по нескольким активным коллекциям
- KZ/World убраны как хардкоженый географический split; стали полноценными встроенными коллекциями
- Плоский layout в timeline (убраны `kzLanesTotal`/`worldLanesTotal`/регион-метки)
- UX-терминология: Субъект→Участник, Эпохи→Периоды, Вселенная→Коллекция, "основная"→"встроенная", "Буфер настоящего"→"Маркер настоящего", Vibe-лейблы переведены на русский
- Убрано "KZ/World" из результатов поиска — теперь показывается реальный тег места
- Исправлен баг: `kind==='person'` → `kind==='subject' && subkind==='person'` (лейбл "Год рождения" не показывался)
- Фикс клиппинга модалов: `ReactDOM.createPortal` на `document.body` — модалы рендерились внутри `.universe-dropdown` с `transform`, что ломало `position:fixed`
- Исправлен preview-сервер: старый путь `/Users/bekas/Developer/Projects/TarixTimeline` → симлинк на актуальный `tarixi-timeline`

### Что изменилось в файлах
- `universe-manager.jsx` — `UniverseManagerPanel` body, портал для обоих модалов, "Коллекция" везде
- `app.jsx` — multi-select state, `handleToggleUniverse`, `filterByUniverses`, UX-лейблы
- `legend.jsx` — `KIND_META`: "Участники", "Периоды"
- `data.jsx` — `filterByUniverse` для kz/world, `filterByUniverses`, built-in protected universes
- `timeline.jsx` — плоский layout, убраны регион-зоны и метки
- `detail.jsx` — `isSubject`/`isEra` вместо `isPerson`/`isPeriod`
- `styles.css` — CSS universe-manager, multi-select стили (active border accent)
- `index.html` — версии скриптов v29, CSS v26
- `.claude/launch.json` + `serve.sh` — правильный рабочий каталог для preview

### Коммиты
- `773c82b` — multi-select universes, remove KZ/World split, fix legacy refs
- `8fc9955` — ux: rename labels, unify terminology, fix search region display
- `5759e9b` — fix: modal clipping inside dropdown transform context

### Следующие шаги
- Пустое состояние таймлайна (когда коллекция пуста или все фильтры сняты)
- Новый объект создавать в активной коллекции, а не всегда в `main`
- Форма создания: "Подтип субъекта" → более понятный лейбл или переработка
- Поиск — заменить `эпоху` на `период` в placeholder
- Проверить `findContemporaries` в Detail panel

---

## [2026-06-18] Агент: Claude Code | Сессия: Баги в Legend и universe checkbox

### Что сделано
- Восстановлены секции "Область" (domain) и "Место" (place) в Legend — были вычислены но не рендерились в JSX
- Исправлен баг: нельзя было снять галочку с последней коллекции (universe)

### Что изменилось в файлах
- `legend.jsx` — добавлены два блока `.legend-facet` с тоглами domain/place тегов и кнопкой "+ тег"
- `app.jsx` — убрана защита `next.size > 1` в `handleToggleUniverse`, теперь можно снять все галочки

### Причина / контекст
Секции тегов исчезли после одного из предыдущих рефакторингов (предположительно коммит `ff55a41`).
Universe guard блокировал снятие единственной коллекции.

### Следующие шаги
- Проверить фильтрацию: isItemVisible использует OR внутри фасета, AND между фасетами — убедиться что при пустом фасете всё корректно
- Добавить народности/города в данные
- Detail panel — современники через findContemporaries

---

## [2026-06-18] Агент: Claude Code | Сессия: Настройка агентной инфраструктуры

### Что сделано
- Создан `CLAUDE.md` — инструкции для AI-агентов (стек, модель данных, конвенции, протокол работы)
- Создан `WORK_LOG.md` — этот файл, append-only журнал сессий

### Что изменилось в файлах
- `CLAUDE.md` — создан (новый файл)
- `WORK_LOG.md` — создан (новый файл)

### Причина / контекст
Проект ведётся параллельно в Claude Code и opencode. Нужна структура для передачи контекста между агентами без потери истории изменений.

### Следующие шаги (из PROJECT_STATE.md)
- Добавить народности/города в данные (сейчас только люди и государства)
- Detail panel — показывать современников через `findContemporaries`
- Связи между объектами — визуальные линии «учитель→ученик»
- Поиск по имени (расширить HeaderSearch)
- Переход к полноценному бэку и фронту после завершения MVP

---

<!-- Новые записи добавляются ВЫШЕ этой строки -->
