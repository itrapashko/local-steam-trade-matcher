# Деплой

## GitHub Pages

Сайт: https://itrapashko.github.io/local-steam-trade-matcher/

При push в `main` workflow [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) собирает `dist/` и пушит в ветку `gh-pages`.

### Настройка Pages (один раз)

1. **Settings → Pages → Build and deployment → Source:** Deploy from a branch
2. **Branch:** `gh-pages` / `/ (root)`

### Переменная прокси

**Settings → Secrets and variables → Actions → Variables:**

| Name | Value |
|------|--------|
| `VITE_PROXY_BASE_URL` | URL Cloudflare Worker без `/` в конце |

Без этой переменной сайт откроется, но поиск ботов не заработает. Подробнее: [proxy.md](proxy.md).

После добавления или изменения переменной перезапустите деплой (push в `main` или **Actions → Deploy to GitHub Pages → Run workflow**).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с Vite proxy |
| `npm run build` | Production-сборка |
| `npm run build:pages` | Сборка для GitHub Pages (`base`: `/local-steam-trade-matcher/`) |
| `npm run preview` | Просмотр сборки |
| `npm test` | Unit-тесты |

## Локальная сборка для Pages

```bash
npm run build:pages
npm run preview
```

С прокси (PowerShell):

```powershell
$env:VITE_PROXY_BASE_URL="https://your-worker.workers.dev"; npm run build:pages
```

## Структура проекта

```
src/           — React-приложение
proxy/         — Cloudflare Worker
.github/       — CI/CD (деплой на gh-pages)
```
