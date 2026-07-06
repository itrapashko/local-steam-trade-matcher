import { describe, expect, it } from 'vitest'
import { MATCHABLE_TRADING_CARD, type AsfBot } from '../types/asf'
import type { BotMatchResult } from '../types/steam'
import { filterBotResults } from './filterResults'

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

function makeResult(
  bot: Partial<AsfBot>,
  cards: { name: string; quantity: number }[],
): BotMatchResult {
  return {
    bot: makeBot(bot),
    cards: cards.map((c) => ({ ...c, imageUrl: null })),
    gameAppId: 440,
    cardType: 'regular',
  }
}

describe('filterBotResults', () => {
  const results = [
    makeResult({ Nickname: 'FairBot', MatchEverything: false }, [
      { name: 'Card A', quantity: 1 },
      { name: 'Card B', quantity: 2 },
    ]),
    makeResult({ Nickname: 'AnyBot', MatchEverything: true }, [
      { name: 'Card A', quantity: 1 },
    ]),
    makeResult({ Nickname: 'AnyFull', MatchEverything: true }, [
      { name: 'Card A', quantity: 1 },
      { name: 'Card B', quantity: 1 },
    ]),
  ]

  it('returns all results when no filters are active', () => {
    expect(
      filterBotResults(results, { anyModeOnly: false, selectedCardNames: [] }),
    ).toHaveLength(3)
  })

  it('keeps only Any-mode bots', () => {
    const filtered = filterBotResults(results, {
      anyModeOnly: true,
      selectedCardNames: [],
    })
    expect(filtered.map((r) => r.bot.Nickname)).toEqual(['AnyBot', 'AnyFull'])
  })

  it('keeps bots that have at least one selected card', () => {
    const filtered = filterBotResults(results, {
      anyModeOnly: false,
      selectedCardNames: ['Card A', 'Card B'],
    })
    expect(filtered.map((r) => r.bot.Nickname)).toEqual([
      'FairBot',
      'AnyBot',
      'AnyFull',
    ])
  })

  it('combines Any-mode and card filters', () => {
    const filtered = filterBotResults(results, {
      anyModeOnly: true,
      selectedCardNames: ['Card A', 'Card B'],
    })
    expect(filtered.map((r) => r.bot.Nickname)).toEqual(['AnyBot', 'AnyFull'])
  })
})
