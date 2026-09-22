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
    cards: cards.map((c, i) => ({
      ...c,
      imageUrl: null,
      index: i + 1,
      setSize: cards.length,
    })),
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
      filterBotResults(results, {
        anyModeOnly: false,
        showWithheldFairBots: true,
        selectedCardNames: [],
      }),
    ).toHaveLength(3)
  })

  it('keeps only Any-mode bots', () => {
    const filtered = filterBotResults(results, {
      anyModeOnly: true,
      showWithheldFairBots: false,
      selectedCardNames: [],
    })
    expect(filtered.map((r) => r.bot.Nickname)).toEqual(['AnyBot', 'AnyFull'])
  })

  it('keeps bots that have at least one selected card', () => {
    const filtered = filterBotResults(results, {
      anyModeOnly: false,
      showWithheldFairBots: true,
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
      showWithheldFairBots: false,
      selectedCardNames: ['Card A', 'Card B'],
    })
    expect(filtered.map((r) => r.bot.Nickname)).toEqual(['AnyBot', 'AnyFull'])
  })

  it('hides Fair bots that will not give any relevant card', () => {
    const locked = [
      ...results,
      makeResult({ Nickname: 'LockedFair', MatchEverything: false }, [
        { name: 'Card A', quantity: 1 },
        { name: 'Card B', quantity: 1 },
      ]),
    ]
    const filtered = filterBotResults(locked, {
      anyModeOnly: false,
      showWithheldFairBots: false,
      selectedCardNames: [],
    })
    expect(filtered.map((r) => r.bot.Nickname)).toEqual([
      'FairBot',
      'AnyBot',
      'AnyFull',
    ])
  })

  it('hides a Fair bot when every selected card is protected', () => {
    const filtered = filterBotResults(results, {
      anyModeOnly: false,
      showWithheldFairBots: false,
      selectedCardNames: ['Card A'],
    })
    expect(filtered.map((r) => r.bot.Nickname)).toEqual(['AnyBot', 'AnyFull'])
  })

  it('shows protected Fair bots when the option is on', () => {
    const filtered = filterBotResults(results, {
      anyModeOnly: false,
      showWithheldFairBots: true,
      selectedCardNames: ['Card A'],
    })
    expect(filtered.map((r) => r.bot.Nickname)).toEqual([
      'FairBot',
      'AnyBot',
      'AnyFull',
    ])
  })
})
