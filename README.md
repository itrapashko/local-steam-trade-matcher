# Local Steam Trade Matcher

Клиентское веб-приложение для поиска ASF-ботов ([ASF STM](https://asf.justarchi.net/STM)), у которых есть торговые карточки выбранной игры.

## Возможности (v1)

- Выбор игры по AppID или названию (autocomplete)
- Поиск по списку ботов из [ASF Listing API](https://asf.justarchi.net/Api/Listing/Bots)
- Прогресс в реальном времени, найденные боты появляются сразу
- Пауза и продолжение поиска
- Для каждого бота — список owned-карточек игры (страница `gamecards/{appId}`)

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте URL из терминала (обычно `http://localhost:5173`).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с Vite proxy |
| `npm run build` | Production-сборка |
| `npm run preview` | Просмотр сборки |
| `npm test` | Unit-тесты (парсер HTML) |

## CORS и прокси

Steam Community и ASF API не отдают CORS-заголовки. В **режиме разработки** Vite проксирует запросы:

- `/api/asf/*` → `https://asf.justarchi.net`
- `/api/steam/*` → `https://steamcommunity.com`

Список игр загружается с GitHub ([jsnli/steamappidlist](https://github.com/jsnli/steamappidlist), обновляется ежедневно) и кэшируется в IndexedDB (список слишком большой для `localStorage`).

### GitHub Pages

Статическая сборка (`npm run build`) работает без бэкенда, но **поиск ботов не заработает**, пока не подключён внешний прокси (например Cloudflare Worker). В настройках приложения можно указать **Base URL прокси** — тогда запросы пойдут на `{proxy}/api/asf/...` и `{proxy}/api/steam/...`.

Деплой на GitHub Pages:

```bash
GITHUB_PAGES=1 npm run build
# опубликовать содержимое dist/ в ветку gh-pages
```

`base` в Vite: `/local-steam-trade-matcher/` при `GITHUB_PAGES=1`.

## Ограничения

- Поиск использует страницу `gamecards/{appId}` — видны **обычные** карточки сета; foil-карточки на ней обычно не отображаются
- ~500 ботов × ~1 с задержки ≈ 8–10 минут на полный проход
- Steam может вернуть 429 при слишком частых запросах — в коде есть задержка и retry

## Структура

Подробный план: [docs/PLAN.md](docs/PLAN.md)
