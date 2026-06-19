# Work Log — TarixiTimeline

> Append-only журнал сессий. Только дописывать новые записи в начало.
> Каждый AI-агент добавляет запись после завершения работы.
> Формат: дата + агент + что сделано + что изменилось + следующие шаги.

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
