import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MATCHABLE_TRADING_CARD, type AsfBot } from '../types/asf'
import {
  applyBotSearchEvent,
  initialSearchProgress,
  type BotSearchEvent,
  type SearchProgress,
} from '../types/steam'
import { BotSearchService, filterBots, sortBotsByCardCount } from './botSearch'

vi.mock('../api/asfBots', () => ({
  fetchBots: vi.fn(),
}))

vi.mock('../api/gameCards', () => ({
  fetchOwnedGameCards: vi.fn(),
}))

import { fetchBots } from '../api/asfBots'
import { fetchOwnedGameCards } from '../api/gameCards'
import type { ApiClient } from '../api/client'
import * as rateLimit from '../utils/rateLimit'

const mockClient = {} as ApiClient

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

function trackProgress(initial: SearchProgress = initialSearchProgress) {
  let state = initial
  return {
    getState: () => state,
    onEvent: (event: BotSearchEvent) => {
      state = applyBotSearchEvent(state, event)
    },
  }
}

describe('applyBotSearchEvent', () => {
  const searching: SearchProgress = {
    status: 'searching',
    checked: 10,
    total: 412,
    found: 2,
    currentBotNickname: 'Bot10',
    errorMessage: null,
  }

  it('keeps counters on pause', () => {
    expect(applyBotSearchEvent(searching, { kind: 'paused' })).toEqual({
      ...searching,
      status: 'paused',
    })
  })

  it('restores searching on resume', () => {
    const paused = applyBotSearchEvent(searching, { kind: 'paused' })
    expect(applyBotSearchEvent(paused, { kind: 'resumed' })).toEqual(searching)
  })
})

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

describe('BotSearchService pause', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchBots).mockResolvedValue([
      makeBot({ Nickname: 'Bot1', SteamIDText: '76561198001468641' }),
      makeBot({ Nickname: 'Bot2', SteamIDText: '76561198001468642' }),
    ])
  })

  it('keeps checked count when pausing during rate-limit delay', async () => {
    vi.spyOn(rateLimit, 'delay').mockImplementation(() => new Promise<void>(() => {}))

    const bots = Array.from({ length: 3 }, (_, i) =>
      makeBot({ Nickname: `Bot${i + 1}`, SteamIDText: `7656119800146864${i}` }),
    )
    vi.mocked(fetchBots).mockResolvedValue(bots)
    vi.mocked(fetchOwnedGameCards).mockResolvedValue([])

    const tracker = trackProgress()
    const service = new BotSearchService(mockClient, {
      onEvent: tracker.onEvent,
      onMatch: () => {},
    })

    void service.start({ gameAppId: 570 })

    await vi.waitFor(() => expect(tracker.getState().status).toBe('searching'))
    await vi.waitFor(() => expect(tracker.getState().checked).toBe(1))

    service.pause()
    expect(tracker.getState()).toEqual({
      status: 'paused',
      checked: 1,
      total: 3,
      found: 0,
      currentBotNickname: 'Bot1',
      errorMessage: null,
    })

    vi.mocked(rateLimit.delay).mockRestore()
  })

  it('keeps checked count when pausing during bot fetch', async () => {
    let resolveFetch!: (cards: []) => void
    const fetchPromise = new Promise<[]>((resolve) => {
      resolveFetch = resolve
    })

    const bots = Array.from({ length: 3 }, (_, i) =>
      makeBot({ Nickname: `Bot${i + 1}`, SteamIDText: `7656119800146864${i}` }),
    )
    vi.mocked(fetchBots).mockResolvedValue(bots)
    vi.mocked(fetchOwnedGameCards)
      .mockResolvedValueOnce([])
      .mockImplementationOnce(() => fetchPromise)
      .mockResolvedValue([])

    const tracker = trackProgress()
    const service = new BotSearchService(mockClient, {
      onEvent: tracker.onEvent,
      onMatch: () => {},
    })

    const startPromise = service.start({ gameAppId: 570, rateLimitMs: 0 })

    await vi.waitFor(() =>
      expect(tracker.getState()).toMatchObject({ checked: 2, currentBotNickname: 'Bot2' }),
    )

    service.pause()
    expect(tracker.getState()).toMatchObject({ status: 'paused', checked: 2 })

    resolveFetch([])
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(tracker.getState()).toMatchObject({ status: 'paused', checked: 2 })

    service.resume()
    await startPromise

    expect(tracker.getState().status).toBe('done')
  })

  it('keeps paused status after in-flight fetch completes', async () => {
    let resolveFetch!: (cards: []) => void
    const fetchPromise = new Promise<[]>((resolve) => {
      resolveFetch = resolve
    })

    vi.mocked(fetchOwnedGameCards)
      .mockImplementationOnce(() => fetchPromise)
      .mockResolvedValue([])

    const tracker = trackProgress()
    const service = new BotSearchService(mockClient, {
      onEvent: tracker.onEvent,
      onMatch: () => {},
    })

    const startPromise = service.start({ gameAppId: 570, rateLimitMs: 0 })

    await vi.waitFor(() => expect(fetchOwnedGameCards).toHaveBeenCalled())

    service.pause()
    expect(tracker.getState().status).toBe('paused')

    resolveFetch([])
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(tracker.getState().status).toBe('paused')

    service.resume()
    await startPromise

    expect(tracker.getState().status).toBe('done')
  })
})
