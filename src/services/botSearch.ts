import { fetchBots } from '../api/asfBots'
import type { ApiClient } from '../api/client'
import { fetchOwnedGameCards } from '../api/gameCards'
import {
  MATCHABLE_FOIL_CARD,
  MATCHABLE_TRADING_CARD,
  type AsfBot,
} from '../types/asf'
import type { BotMatchResult, BotSearchEvent } from '../types/steam'
import { totalCardCount } from './parseGameCardsHtml'
import { DEFAULT_RATE_LIMIT_MS, delay } from '../utils/rateLimit'
import { buildGameCardsUrl } from '../utils/steamId'

export interface BotSearchCallbacks {
  onEvent: (event: BotSearchEvent) => void
  onMatch: (result: BotMatchResult) => void
}

export interface BotSearchOptions {
  gameAppId: number
  rateLimitMs?: number
}

export class BotSearchService {
  private aborted = false;
  private paused = false;
  private pauseResolver: (() => void) | null = null;
  private currentIndex = 0;
  private bots: AsfBot[] = [];

  constructor(
    private readonly client: ApiClient,
    private readonly callbacks: BotSearchCallbacks,
  ) { }

  pause(): void {
    this.paused = true
    this.emitEvent({ kind: 'paused' })
  }

  resume(): void {
    if (!this.paused) {
      return
    }
    this.paused = false
    this.emitEvent({ kind: 'resumed' })
    this.pauseResolver?.()
    this.pauseResolver = null
  }

  stop(): void {
    this.aborted = true
    this.paused = false
    this.pauseResolver?.()
    this.pauseResolver = null
    this.emitEvent({ kind: 'stopped' })
  }

  async start(options: BotSearchOptions): Promise<void> {
    this.aborted = false
    this.paused = false
    this.currentIndex = 0
    this.found = 0

    try {
      await this.emitEventAwaitingResume({ kind: 'loading-bots' })
      const allBots = await fetchBots(this.client)
      this.bots = sortBotsByCardCount(filterBots(allBots))

      const total = this.bots.length
      if (total === 0) {
        await this.emitEventAwaitingResume({ kind: 'done', total: 0, found: 0 })
        return
      }

      await this.emitEventAwaitingResume({
        kind: 'searching',
        checked: 0,
        total,
        found: 0,
        currentBotNickname: null,
      })
      if (this.aborted) {
        return
      }

      for (let i = this.currentIndex; i < this.bots.length; i++) {
        if (this.aborted) {
          return
        }

        this.currentIndex = i
        const bot = this.bots[i]!
        const steamId = bot.SteamIDText
        const gameCardsUrl = `${buildGameCardsUrl(steamId, options.gameAppId)}?l=english`
        console.log(`[STM Search] ${bot.Nickname} — ${gameCardsUrl}`)
        await this.emitEventAwaitingResume({
          kind: 'searching',
          checked: i + 1,
          total,
          found: this.found,
          currentBotNickname: bot.Nickname,
        })
        if (this.aborted) {
          return
        }

        const cards = await fetchOwnedGameCards(
          this.client,
          steamId,
          options.gameAppId,
        )

        if (this.aborted) {
          return
        }

        if (totalCardCount(cards) > 0) {
          this.found += 1
          this.callbacks.onMatch({
            bot,
            cards,
            gameAppId: options.gameAppId,
          })
          await this.emitEventAwaitingResume({
            kind: 'searching',
            checked: i + 1,
            total,
            found: this.found,
            currentBotNickname: bot.Nickname,
          })
          if (this.aborted) {
            return
          }
        }

        if (i < this.bots.length - 1 && !this.aborted) {
          await delay(options.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS)
          if (this.aborted) {
            return
          }
        }
      }

      if (!this.aborted) {
        await this.emitEventAwaitingResume({ kind: 'done', total, found: this.found })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.emitEvent({ kind: 'error', message })
    }
  }

  private found = 0;

  private async waitIfPaused(): Promise<void> {
    if (!this.paused || this.aborted) {
      return
    }
    await new Promise<void>((resolve) => {
      this.pauseResolver = resolve
    })
  }

  private emitEvent(event: BotSearchEvent): void {
    this.callbacks.onEvent(event)
  }

  private async emitEventAwaitingResume(event: BotSearchEvent): Promise<void> {
    await this.waitIfPaused()
    if (this.aborted) {
      return
    }
    this.emitEvent(event)
  }
}

export function filterBots(bots: AsfBot[]): AsfBot[] {
  return bots.filter((bot) => {
    if (bot.TotalGamesCount === 0) {
      return false
    }
    const types = bot.MatchableTypes ?? []
    return (
      types.includes(MATCHABLE_TRADING_CARD) || types.includes(MATCHABLE_FOIL_CARD)
    )
  })
}

/** Bots with more cards first (TotalItemsCount in ASF listing). */
export function sortBotsByCardCount(bots: AsfBot[]): AsfBot[] {
  return [...bots].sort((a, b) => {
    if (b.TotalItemsCount !== a.TotalItemsCount) {
      return b.TotalItemsCount - a.TotalItemsCount
    }
    if (b.TotalGamesCount !== a.TotalGamesCount) {
      return b.TotalGamesCount - a.TotalGamesCount
    }
    return a.Nickname.localeCompare(b.Nickname, 'en')
  })
}
