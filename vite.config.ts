import react from '@vitejs/plugin-react';
import type { ProxyOptions } from 'vite';
import { defineConfig } from 'vite';

const STEAM_ORIGIN = 'https://steamcommunity.com';

function rewriteSteamRedirectLocation(proxyRes: { headers: Record<string, string | string[] | undefined> }) {
  const location = proxyRes.headers.location;
  if (!location) {
    return;
  }
  const value = Array.isArray(location) ? location[0] : location;
  if (value.startsWith(STEAM_ORIGIN)) {
    proxyRes.headers.location = value.replace(STEAM_ORIGIN, '/api/steam');
  } else if (value.startsWith('/')) {
    proxyRes.headers.location = `/api/steam${value}`;
  }
}

const steamProxy: ProxyOptions = {
  target: STEAM_ORIGIN,
  changeOrigin: true,
  followRedirects: true,
  rewrite: (path) => path.replace(/^\/api\/steam/, ''),
  configure: (proxy) => {
    proxy.on('proxyRes', rewriteSteamRedirectLocation);
  },
};

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/local-steam-trade-matcher/' : '/',
  server: {
    proxy: {
      '/api/asf': {
        target: 'https://asf.justarchi.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/asf/, ''),
      },
      '/api/steam': steamProxy,
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
