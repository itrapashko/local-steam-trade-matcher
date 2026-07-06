import type { ApiClient } from './client'
import {
  gameHasTradingCards,
  parseGameCardsHtml,
  parseGameSetCards,
  type GameSetCard,
} from '../services/parseGameCardsHtml'
import type { CardType, OwnedGameCard } from '../types/steam'

function gameCardsPath(
  steamId: number | string,
  appId: number,
  cardType: CardType = 'regular',
): string {
  const params = new URLSearchParams({ l: 'english' })
  if (cardType === 'foil') {
    params.set('border', '1')
  }
  return `/api/steam/profiles/${steamId}/gamecards/${appId}/?${params.toString()}`
}

export async function fetchGameCardsHtml(
  client: ApiClient,
  steamId: number | string,
  appId: number,
  cardType: CardType = 'regular',
): Promise<string> {
  return client.fetchText(gameCardsPath(steamId, appId, cardType))
}

export async function checkGameHasTradingCards(
  client: ApiClient,
  steamId: number | string,
  appId: number,
  cardType: CardType = 'regular',
): Promise<boolean> {
  const html = await fetchGameCardsHtml(client, steamId, appId, cardType)
  return gameHasTradingCards(html)
}

export async function fetchGameSetCards(
  client: ApiClient,
  steamId: number | string,
  appId: number,
  cardType: CardType = 'regular',
): Promise<GameSetCard[] | null> {
  const html = await fetchGameCardsHtml(client, steamId, appId, cardType)
  if (!gameHasTradingCards(html)) {
    return null
  }
  return parseGameSetCards(html)
}

export async function fetchOwnedGameCards(
  client: ApiClient,
  steamId: number | string,
  appId: number,
  cardType: CardType = 'regular',
): Promise<OwnedGameCard[]> {
  try {
    const html = await fetchGameCardsHtml(client, steamId, appId, cardType)
    return parseGameCardsHtml(html)
  } catch (error) {
    console.warn(`[STM] Failed to load cards ${steamId}/${appId}:`, error)
    return []
  }
}
