import { fetchBots } from '../api/asfBots'
import type { ApiClient } from '../api/client'
import { fetchOwnedGameCards } from '../api/gameCards'
import {
  MATCHABLE_FOIL_CARD,
  MATCHABLE_TRADING_CARD,
  type AsfBot,
} from '../types/asf'
import type { BotMatchResult, SearchProgress } from '../types/steam'
import { totalCardCount } from './parseGameCardsHtml'
import { DEFAULT_RATE_LIMIT_MS, delay } from '../utils/rateLimit'
import { buildGameCardsUrl } from '../utils/steamId'

export interface BotSearchCallbacks {
  onProgress: (progress: SearchProgress) => void
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
    this.emitProgress('paused')
  }

  resume(): void {
    if (!this.paused) {
      return
    }
    this.paused = false
    this.emitProgress('searching')
    this.pauseResolver?.()
    this.pauseResolver = null
  }

  stop(): void {
    this.aborted = true
    this.paused = false
    this.pauseResolver?.()
    this.pauseResolver = null
    this.emitProgress('stopped')
  }

  async start(options: BotSearchOptions): Promise<void> {
    this.aborted = false
    this.paused = false
    this.currentIndex = 0
    this.found = 0

    try {
      this.emitProgress('loading-bots', null, 0, 0)
      const allBots = await fetchBots(this.client)
      this.bots = sortBotsByCardCount(filterBots(allBots))

      const total = this.bots.length
      if (total === 0) {
        this.emitProgress('done', null, 0, 0)
        return
      }

      this.emitProgress('searching', null, 0, total)

      for (let i = this.currentIndex; i < this.bots.length; i++) {
        await this.waitIfPaused()
        if (this.aborted) {
          return
        }

        this.currentIndex = i
        const bot = this.bots[i]!
        const steamId = bot.SteamIDText
        const gameCardsUrl = `${buildGameCardsUrl(steamId, options.gameAppId)}?l=english`
        console.log(`[STM Search] ${bot.Nickname} — ${gameCardsUrl}`)
        this.emitProgress('searching', bot.Nickname, i, total)

        const cards = await fetchOwnedGameCards(
          this.client,
          steamId,
          options.gameAppId,
        )

        if (totalCardCount(cards) > 0) {
          this.found += 1
          this.callbacks.onMatch({
            bot,
            cards,
            gameAppId: options.gameAppId,
          })
        }

        this.emitProgress('searching', bot.Nickname, i + 1, total)

        if (i < this.bots.length - 1 && !this.aborted) {
          await delay(options.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS)
        }
      }

      if (!this.aborted) {
        this.emitProgress('done', null, total, total)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка'
      this.callbacks.onProgress({
        checked: this.currentIndex,
        total: this.bots.length,
        found: this.found,
        currentBotNickname: null,
        status: 'error',
        errorMessage: message,
      })
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

  private emitProgress(
    status: SearchProgress['status'],
    currentBotNickname: string | null = null,
    checked = this.currentIndex,
    total = this.bots.length,
  ): void {
    this.callbacks.onProgress({
      checked,
      total,
      found: this.found,
      currentBotNickname,
      status,
      errorMessage: null,
    })
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

/** Сначала боты с большим числом карточек (TotalItemsCount в ASF listing). */
export function sortBotsByCardCount(bots: AsfBot[]): AsfBot[] {
  return [...bots].sort((a, b) => {
    if (b.TotalItemsCount !== a.TotalItemsCount) {
      return b.TotalItemsCount - a.TotalItemsCount
    }
    if (b.TotalGamesCount !== a.TotalGamesCount) {
      return b.TotalGamesCount - a.TotalGamesCount
    }
    return a.Nickname.localeCompare(b.Nickname, 'ru')
  })
}
