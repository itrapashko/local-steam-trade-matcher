import type { ApiClient } from './client'
import { gameHasTradingCards, parseGameCardsHtml } from '../services/parseGameCardsHtml'
import type { OwnedGameCard } from '../types/steam'

function gameCardsPath(steamId: number | string, appId: number): string {
  return `/api/steam/profiles/${steamId}/gamecards/${appId}/?l=english`
}

export async function fetchGameCardsHtml(
  client: ApiClient,
  steamId: number | string,
  appId: number,
): Promise<string> {
  return client.fetchText(gameCardsPath(steamId, appId))
}

export async function checkGameHasTradingCards(
  client: ApiClient,
  steamId: number | string,
  appId: number,
): Promise<boolean> {
  const html = await fetchGameCardsHtml(client, steamId, appId)
  return gameHasTradingCards(html)
}

export async function fetchOwnedGameCards(
  client: ApiClient,
  steamId: number | string,
  appId: number,
): Promise<OwnedGameCard[]> {
  try {
    const html = await fetchGameCardsHtml(client, steamId, appId)
    return parseGameCardsHtml(html)
  } catch (error) {
    console.warn(`[STM] Failed to load cards ${steamId}/${appId}:`, error)
    return []
  }
}
