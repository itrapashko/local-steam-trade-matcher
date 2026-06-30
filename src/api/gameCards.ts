import type { ApiClient } from './client'
import { parseGameCardsHtml } from '../services/parseGameCardsHtml'
import type { OwnedGameCard } from '../types/steam'

export async function fetchOwnedGameCards(
  client: ApiClient,
  steamId: number | string,
  appId: number,
): Promise<OwnedGameCard[]> {
  try {
    const html = await client.fetchText(
      `/api/steam/profiles/${steamId}/gamecards/${appId}/?l=english`,
    )
    return parseGameCardsHtml(html)
  } catch (error) {
    console.warn(`[STM] Failed to load cards ${steamId}/${appId}:`, error)
    return []
  }
}
