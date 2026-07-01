export const STEAM_ID64_BASE = 76561197960265728n

/** Public profile used only to load a game's badge/card page (ownership irrelevant). */
export const REFERENCE_STEAM_ID = '76561199483008583'

export function steamIdToAccountId(steamId: number | string): string {
  const id = BigInt(steamId)
  return (id - STEAM_ID64_BASE).toString()
}

export function buildTradeOfferUrl(steamId: number | string, tradeToken: string): string {
  const partner = steamIdToAccountId(steamId)
  return `https://steamcommunity.com/tradeoffer/new/?partner=${partner}&token=${tradeToken}`
}

export function buildGameCardsUrl(steamId: number | string, appId: number): string {
  return `https://steamcommunity.com/profiles/${steamId}/gamecards/${appId}/`
}

export function buildInventoryUrl(steamId: number | string): string {
  return `https://steamcommunity.com/profiles/${steamId}/inventory/#753_6`
}

export function buildAvatarUrl(avatarHash: string | null): string | null {
  if (!avatarHash) {
    return null
  }
  return `https://avatars.steamstatic.com/${avatarHash}_full.jpg`
}
