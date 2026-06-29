export const MATCHABLE_TRADING_CARD = 3
export const MATCHABLE_FOIL_CARD = 5

export type MatchableType =
  | typeof MATCHABLE_TRADING_CARD
  | typeof MATCHABLE_FOIL_CARD
  | 2
  | 4

export interface AsfBot {
  SteamIDText: string
  Nickname: string
  AvatarHash: string | null
  MatchableTypes: number[]
  MatchEverything: boolean
  MaxTradeHoldDuration: number
  TotalGamesCount: number
  TotalInventoryCount: number
  TotalItemsCount: number
  TradeToken: string
}

export type TradeMode = 'Any' | 'Fair'

export function getBotTradeMode(bot: AsfBot): TradeMode {
  return bot.MatchEverything ? 'Any' : 'Fair'
}
