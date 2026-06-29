const STEAM_ORIGIN_HTTPS = 'https://steamcommunity.com'
const STEAM_ORIGIN_HTTP = 'http://steamcommunity.com'
export const MAX_STEAM_REDIRECTS = 5

/** Переписывает Location с steamcommunity.com на путь через /api/steam прокси. */
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
  return path.startsWith('/api/steam')
}
