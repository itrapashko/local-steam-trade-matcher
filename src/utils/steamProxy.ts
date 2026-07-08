const STEAM_ORIGIN_HTTPS = 'https://steamcommunity.com'
const STEAM_ORIGIN_HTTP = 'http://steamcommunity.com'
export const MAX_STEAM_REDIRECTS = 5

/** Rewrites Location from steamcommunity.com to a path via the /api/steam proxy. */
export function toProxiedSteamUrl(location: string, apiBaseUrl: string): string {
  let path: string

  if (location.startsWith(STEAM_ORIGIN_HTTPS)) {
    path = location.slice(STEAM_ORIGIN_HTTPS.length)
  } else if (location.startsWith(STEAM_ORIGIN_HTTP)) {
    path = location.slice(STEAM_ORIGIN_HTTP.length)
  } else if (location.startsWith('/')) {
    path = location
  } else {
    return location
  }

  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  const prefix = apiBaseUrl ? `${apiBaseUrl}/api/steam` : '/api/steam'
  return `${prefix}${path}`
}

export function isSteamApiPath(path: string): boolean {
  // Accept both:
  // - relative paths: `/api/steam/...`
  // - absolute URLs after proxy resolution: `https://host/api/steam/...`
  try {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return new URL(path).pathname.startsWith('/api/steam')
    }
  } catch {
    // If URL parsing fails, fall back to string check below.
  }
  return path.startsWith('/api/steam')
}
