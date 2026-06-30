# Deployment

## GitHub Pages

Live site: https://itrapashko.github.io/local-steam-trade-matcher/

On push to `main`, the [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) workflow builds `dist/` and pushes to the `gh-pages` branch.

### Pages setup (one time)

1. **Settings → Pages → Build and deployment → Source:** Deploy from a branch
2. **Branch:** `gh-pages` / `/ (root)`

### Proxy variable

**Settings → Secrets and variables → Actions → Variables:**

| Name | Value |
|------|--------|
| `VITE_PROXY_BASE_URL` | Cloudflare Worker URL with no trailing `/` |

Without this variable the site loads, but bot search will not work. See [proxy.md](proxy.md).

After adding or changing the variable, redeploy (push to `main` or **Actions → Deploy to GitHub Pages → Run workflow**).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with Vite proxy |
| `npm run build` | Production build |
| `npm run build:pages` | Build for GitHub Pages (`base`: `/local-steam-trade-matcher/`) |
| `npm run preview` | Preview production build |
| `npm test` | Unit tests |

## Local Pages build

```bash
npm run build:pages
npm run preview
```

With proxy (PowerShell):

```powershell
$env:VITE_PROXY_BASE_URL="https://your-worker.workers.dev"; npm run build:pages
```

## Project layout

```
src/           — React app
proxy/         — Cloudflare Worker
.github/       — CI/CD (deploy to gh-pages)
```
