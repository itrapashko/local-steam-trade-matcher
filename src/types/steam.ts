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
}

export type SearchStatus =
  | 'idle'
  | 'loading-bots'
  | 'searching'
  | 'paused'
  | 'done'
  | 'stopped'
  | 'no-cards'
  | 'error'

export interface SearchProgress {
  checked: number
  total: number
  found: number
  currentBotNickname: string | null
  status: SearchStatus
  errorMessage: string | null
}
