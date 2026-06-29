import { describe, expect, it } from 'vitest'
import { getBotTradeMode, type AsfBot } from './asf'

const baseBot: AsfBot = {
  SteamIDText: '76561198000000000',
  Nickname: 'Test',
  AvatarHash: null,
  MatchableTypes: [3],
  MatchEverything: false,
  MaxTradeHoldDuration: 0,
  TotalGamesCount: 0,
  TotalInventoryCount: 0,
  TotalItemsCount: 0,
  TradeToken: 'token',
}

describe('getBotTradeMode', () => {
  it('returns Fair when MatchEverything is false', () => {
    expect(getBotTradeMode(baseBot)).toBe('Fair')
  })

  it('returns Any when MatchEverything is true', () => {
    expect(getBotTradeMode({ ...baseBot, MatchEverything: true })).toBe('Any')
  })
})
