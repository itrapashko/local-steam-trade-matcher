export type CardType = 'regular' | 'foil'

export interface OwnedGameCard {
  name: string
  quantity: number
  imageUrl: string | null
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
  currentBotNickname: string | null
  errorMessage: string | null
}

export const initialSearchProgress: SearchProgress = {
  status: 'idle',
  checked: 0,
  total: 0,
  found: 0,
  currentBotNickname: null,
  errorMessage: null,
}

export type BotSearchEvent =
  | { kind: 'loading-bots' }
  | { kind: 'searching'; checked: number; total: number; found: number; currentBotNickname: string | null }
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
        currentBotNickname: event.currentBotNickname,
        errorMessage: null,
      }
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
        currentBotNickname: null,
        errorMessage: null,
      }
    case 'stopped':
      return { ...prev, status: 'stopped', currentBotNickname: null, errorMessage: null }
    case 'error':
      return { ...prev, status: 'error', errorMessage: event.message }
  }
}
