# Прокси и CORS

Steam Community и ASF API не отдают CORS-заголовки. Браузер не может обращаться к ним напрямую с GitHub Pages.

## Режим разработки

Vite проксирует запросы (`vite.config.ts`):

| Путь | Upstream |
|------|----------|
| `/api/asf/*` | `https://asf.justarchi.net` |
| `/api/steam/*` | `https://steamcommunity.com` |

Для Steam дополнительно переписываются заголовки `Location` при редиректах, чтобы браузер оставался на `/api/steam`.

Запуск: `npm run dev` — отдельный прокси не нужен.

## GitHub Pages

На Pages нет бэкенда. Запросы идут на внешний CORS-прокси с теми же путями:

- `{proxy}/api/asf/*` → `https://asf.justarchi.net/*`
- `{proxy}/api/steam/*` → `https://steamcommunity.com/*`

URL прокси вшивается в сборку через переменную `VITE_PROXY_BASE_URL` (см. [deployment.md](deployment.md)).

Код: `src/api/client.ts` — в dev base URL пустой, в production берётся из `import.meta.env.VITE_PROXY_BASE_URL`.

## Cloudflare Worker

Готовый worker: [`proxy/worker.ts`](../proxy/worker.ts).

```bash
cd proxy
npm install
npx wrangler login
npm run deploy
```

После деплоя worker доступен по адресу вида:

`https://local-steam-trade-matcher-proxy.<account>.workers.dev`

Проверка:

```
https://local-steam-trade-matcher-proxy.<account>.workers.dev/api/asf/Api/Listing/Bots
```

Должен вернуться JSON со списком ботов.

Worker следует редиректам Steam на стороне сервера (`redirect: 'follow'`), поэтому браузеру не нужно ходить на `steamcommunity.com` напрямую.

## Список игр

Загружается напрямую с GitHub ([jsnli/steamappidlist](https://github.com/jsnli/steamappidlist), обновляется ежедневно) и кэшируется в IndexedDB — список слишком большой для `localStorage`. Прокси для этого не требуется.
