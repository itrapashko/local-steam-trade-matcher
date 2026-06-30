# Proxy and CORS

Steam Community and the ASF API do not send CORS headers. The browser cannot call them directly from GitHub Pages.

## Development

Vite proxies requests (`vite.config.ts`):

| Path | Upstream |
|------|----------|
| `/api/asf/*` | `https://asf.justarchi.net` |
| `/api/steam/*` | `https://steamcommunity.com` |

For Steam, `Location` headers are rewritten on redirects so the browser stays on `/api/steam`.

Run `npm run dev` — no separate proxy is required.

## GitHub Pages

There is no backend on Pages. Requests go to an external CORS proxy with the same paths:

- `{proxy}/api/asf/*` → `https://asf.justarchi.net/*`
- `{proxy}/api/steam/*` → `https://steamcommunity.com/*`

The proxy URL is baked into the build via `VITE_PROXY_BASE_URL` (see [deployment.md](deployment.md)).

Code: `src/api/client.ts` — empty base URL in dev, `import.meta.env.VITE_PROXY_BASE_URL` in production.

## Cloudflare Worker

Ready-made worker: [`proxy/worker.ts`](../proxy/worker.ts).

```bash
cd proxy
npm install
npx wrangler login
npm run deploy
```

After deploy the worker is available at:

`https://local-steam-trade-matcher-proxy.<account>.workers.dev`

Smoke test:

```
https://local-steam-trade-matcher-proxy.<account>.workers.dev/api/asf/Api/Listing/Bots
```

You should get JSON with the bot list.

The worker follows Steam redirects server-side (`redirect: 'follow'`), so the browser never needs to hit `steamcommunity.com` directly.

## Game list

Loaded directly from GitHub ([jsnli/steamappidlist](https://github.com/jsnli/steamappidlist), updated daily) and cached in IndexedDB — the list is too large for `localStorage`. No proxy is required for this.
