export type CardType = 'regular' | 'foil'

export interface GameSetCard {
  name: string
  imageUrl: string | null
  index: number
  setSize: number
}

export interface OwnedGameCard extends GameSetCard {
  quantity: number
}

export function formatCardIndex(card: Pick<GameSetCard, 'index' | 'setSize'>): string {
  return `${card.index} of ${card.setSize}`
}

export interface SteamApp {
  appid: number
  name: string
}

export interface BotMatchResult {
  bot: import('./asf').AsfBot
  cards: OwnedGameCard[]
  gameAppId: number
  cardType: CardType
}

export type SearchStatus =
  | 'idle'
  | 'loading-bots'
  | 'searching'
  | 'paused'
  | 'done'
  | 'stopped'
  | 'error'

export interface SearchProgress {
  status: SearchStatus
  checked: number
  total: number
  found: number
  failed: number
  currentBotNickname: string | null
  errorMessage: string | null
}

export const initialSearchProgress: SearchProgress = {
  status: 'idle',
  checked: 0,
  total: 0,
  found: 0,
  failed: 0,
  currentBotNickname: null,
  errorMessage: null,
}

export type BotSearchEvent =
  | { kind: 'loading-bots' }
  | { kind: 'searching'; checked: number; total: number; found: number; currentBotNickname: string | null }
  | { kind: 'bot-failed' }
  | { kind: 'paused' }
  | { kind: 'resumed' }
  | { kind: 'done'; total: number; found: number }
  | { kind: 'stopped' }
  | { kind: 'error'; message: string }

export function applyBotSearchEvent(
  prev: SearchProgress,
  event: BotSearchEvent,
): SearchProgress {
  switch (event.kind) {
    case 'loading-bots':
      return { ...initialSearchProgress, status: 'loading-bots' }
    case 'searching':
      return {
        status: 'searching',
        checked: event.checked,
        total: event.total,
        found: event.found,
        failed: prev.failed,
        currentBotNickname: event.currentBotNickname,
        errorMessage: null,
      }
    case 'bot-failed':
      return { ...prev, failed: prev.failed + 1 }
    case 'paused':
      return { ...prev, status: 'paused' }
    case 'resumed':
      return { ...prev, status: 'searching' }
    case 'done':
      return {
        status: 'done',
        checked: event.total,
        total: event.total,
        found: event.found,
        failed: prev.failed,
        currentBotNickname: null,
        errorMessage: null,
      }
    case 'stopped':
      return { ...prev, status: 'stopped', currentBotNickname: null, errorMessage: null }
    case 'error':
      return { ...prev, status: 'error', errorMessage: event.message }
  }
}
