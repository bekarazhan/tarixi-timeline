# Деплой — Cloudflare Pages + чат-прокси

Фронт — статика, чат-прокси — Pages Function (`functions/api/chat.js`) на том же домене.
Ключ Groq лежит в env Cloudflare, в браузер не попадает.

## Как это работает
- **Локально** (`localhost`) чат остаётся в режиме **BYOK** (свой ключ в браузере).
- **В проде** (любой не-localhost домен) фронт автоматически шлёт запросы на `/api/chat`,
  а функция подставляет серверный ключ и стримит ответ. Пользователю ключ не нужен.

## Шаги (один раз)
1. **Cloudflare → Pages → Create → Connect to Git** → выбрать репозиторий `bekarazhan/tarixi-timeline`.
2. **Build settings:**
   - Framework preset: **None**
   - Build command: *(пусто)*
   - Build output directory: **`/`** (корень репозитория)
   - Save and Deploy.
3. **Settings → Environment variables → Add variable** (для Production и Preview):
   - Name: `GROQ_API_KEY`
   - Value: ключ с https://console.groq.com/keys (вид `gsk_…`)
   - Тип: **Secret (Encrypt)**
4. **Deployments → Retry deployment** — чтобы переменная подхватилась.
5. Готово. Функция `/api/chat` определяется автоматически из папки `functions/`.

## Проверка
- Открой выданный домен (`*.pages.dev`), зайди в любую личность → «Поговорить».
- Чат должен отвечать **без запроса ключа** (прокси). Если просит ключ или ошибка —
  не задан `GROQ_API_KEY` или не сделан повторный деплой.

## Опционально
- **Свой домен:** Pages → Custom domains (напр. `tarixi.kz`).
- **Лимит запросов** (защита от слива): Cloudflare → проект → Security → Rate limiting,
  правило на путь `/api/chat` (напр. 20 запросов/мин на IP). Кодить не нужно.

## Заметки
- Сейчас фронт компилит JSX в браузере (Babel standalone) — для MVP ок, чуть медленнее
  первый заход. Перед серьёзным запуском соберём через Vite (быстрее + SEO).
- Сменить модель/провайдера на сервере — в `functions/api/chat.js` (сейчас Groq
  `llama-3.3-70b-versatile`). Фронт трогать не нужно.
