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
| `npm run build:pages` | Сборка для GitHub Pages (`base`: `/local-steam-trade-matcher/`) |
| `npm run preview` | Просмотр сборки |
| `npm test` | Unit-тесты (парсер HTML) |

## CORS и прокси

Steam Community и ASF API не отдают CORS-заголовки. В **режиме разработки** Vite проксирует запросы:

- `/api/asf/*` → `https://asf.justarchi.net`
- `/api/steam/*` → `https://steamcommunity.com`

Список игр загружается с GitHub ([jsnli/steamappidlist](https://github.com/jsnli/steamappidlist), обновляется ежедневно) и кэшируется в IndexedDB (список слишком большой для `localStorage`).

### GitHub Pages

На GitHub Pages нет Vite-прокси. Для поиска ботов нужен внешний CORS-прокси с теми же путями:

- `{proxy}/api/asf/*` → `https://asf.justarchi.net/*`
- `{proxy}/api/steam/*` → `https://steamcommunity.com/*`

В репозитории есть готовый [Cloudflare Worker](proxy/worker.ts):

```bash
cd proxy
npm install
npx wrangler login
npm run deploy
```

После деплоя worker будет доступен по адресу вида `https://local-steam-trade-matcher-proxy.<account>.workers.dev`.

URL worker'а вшивается в сборку через переменную репозитория: **Settings → Secrets and variables → Actions → Variables** → `VITE_PROXY_BASE_URL` = URL worker'а.

Деплой на GitHub Pages (автоматически при push в `main`):

1. В репозитории: **Settings → Pages → Build and deployment → Source: Deploy from a branch**
2. Branch: **`gh-pages`** / **`/ (root)`**
3. Запушьте изменения в `main` — workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) соберёт `dist/` и обновит ветку `gh-pages`.

Сайт будет доступен по адресу: `https://itrapashko.github.io/local-steam-trade-matcher/`

Локальная сборка для Pages:

```bash
npm run build:pages
npm run preview
```

С прокси локально:

```bash
# PowerShell
$env:VITE_PROXY_BASE_URL="https://your-worker.workers.dev"; npm run build:pages
```

## Ограничения

- Поиск использует страницу `gamecards/{appId}` — видны **обычные** карточки сета; foil-карточки на ней обычно не отображаются
- ~500 ботов × ~1 с задержки ≈ 8–10 минут на полный проход
- Steam может вернуть 429 при слишком частых запросах — в коде есть задержка и retry
