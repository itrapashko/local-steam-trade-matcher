import { describe, expect, it } from 'vitest'
import { MATCHABLE_TRADING_CARD, type AsfBot } from '../types/asf'
import { filterBots, sortBotsByCardCount } from './botSearch'

function makeBot(overrides: Partial<AsfBot> = {}): AsfBot {
  return {
    SteamIDText: '76561198001468649',
    Nickname: 'Bot',
    AvatarHash: null,
    MatchableTypes: [MATCHABLE_TRADING_CARD],
    MatchEverything: false,
    MaxTradeHoldDuration: 0,
    TotalGamesCount: 10,
    TotalInventoryCount: 100,
    TotalItemsCount: 100,
    TradeToken: 'abcdefgh',
    ...overrides,
  }
}

describe('filterBots', () => {
  it('keeps bots with trading or foil cards', () => {
    expect(filterBots([makeBot(), makeBot({ MatchableTypes: [5] })])).toHaveLength(2)
  })

  it('removes bots without card types or zero games', () => {
    const bots = [
      makeBot({ MatchableTypes: [2, 4] }),
      makeBot({ TotalGamesCount: 0 }),
    ]
    expect(filterBots(bots)).toHaveLength(0)
  })
})

describe('sortBotsByCardCount', () => {
  it('orders bots by TotalItemsCount descending', () => {
    const sorted = sortBotsByCardCount([
      makeBot({ Nickname: 'Small', TotalItemsCount: 10 }),
      makeBot({ Nickname: 'Large', TotalItemsCount: 500 }),
      makeBot({ Nickname: 'Medium', TotalItemsCount: 100 }),
    ])
    expect(sorted.map((b) => b.Nickname)).toEqual(['Large', 'Medium', 'Small'])
  })

  it('uses TotalGamesCount as tiebreaker', () => {
    const sorted = sortBotsByCardCount([
      makeBot({ Nickname: 'B', TotalItemsCount: 50, TotalGamesCount: 5 }),
      makeBot({ Nickname: 'A', TotalItemsCount: 50, TotalGamesCount: 20 }),
    ])
    expect(sorted.map((b) => b.Nickname)).toEqual(['A', 'B'])
  })
})
