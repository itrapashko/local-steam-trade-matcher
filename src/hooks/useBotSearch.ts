import { useCallback, useEffect, useRef, useState } from 'react'
import { createApiClient } from '../api/client'
import { findAppById, loadAppList, searchApps } from '../api/appList'
import { fetchGameSetCards } from '../api/gameCards'
import { BotSearchService } from '../services/botSearch'
import type { GameSetCard } from '../services/parseGameCardsHtml'
import {
  applyBotSearchEvent,
  initialSearchProgress,
  type CardType,
  type SteamApp,
  type BotMatchResult,
  type BotSearchEvent,
  type SearchProgress,
} from '../types/steam'
import { REFERENCE_STEAM_ID } from '../utils/steamId'

export type GameCardStatus = 'idle' | 'checking' | 'has-cards' | 'no-cards' | 'error'

export function useAppList() {
  const [apps, setApps] = useState<SteamApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadAppList()
      .then((list) => {
        if (!cancelled) {
          setApps(list)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load game list')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { apps, loading, error, searchApps: (q: string) => searchApps(apps, q), findAppById: (id: number) => findAppById(apps, id) }
}

export function useGameCardCheck(game: SteamApp | null, cardType: CardType) {
  const [cardStatus, setCardStatus] = useState<GameCardStatus>('idle')
  const [cardError, setCardError] = useState<string | null>(null)
  const [gameCards, setGameCards] = useState<GameSetCard[]>([])
  const [confirmedAppId, setConfirmedAppId] = useState<number | null>(null)
  const [cardsLoading, setCardsLoading] = useState(false)

  useEffect(() => {
    if (!game) {
      setCardStatus('idle')
      setCardError(null)
      setGameCards([])
      setConfirmedAppId(null)
      setCardsLoading(false)
      return
    }

    let cancelled = false
    const preserveUi = confirmedAppId === game.appid

    if (!preserveUi) {
      setCardStatus('checking')
      setCardError(null)
      setGameCards([])
    }

    setCardsLoading(true)

    const client = createApiClient()
    fetchGameSetCards(client, REFERENCE_STEAM_ID, game.appid, cardType)
      .then((cards) => {
        if (!cancelled) {
          if (cards) {
            setGameCards(cards)
            setCardStatus('has-cards')
            setConfirmedAppId(game.appid)
          } else {
            setGameCards([])
            setCardStatus('no-cards')
          }
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setCardStatus('error')
          setCardError(err instanceof Error ? err.message : 'Failed to check trading cards')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCardsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [game, cardType])

  const showCardFilters = game != null && confirmedAppId === game.appid

  return { cardStatus, cardError, gameCards, showCardFilters, cardsLoading }
}

export function useBotSearch() {
  const serviceRef = useRef<BotSearchService | null>(null)
  const [progress, setProgress] = useState<SearchProgress>(initialSearchProgress)
  const [results, setResults] = useState<BotMatchResult[]>([])
  const [selectedGame, setSelectedGame] = useState<SteamApp | null>(null)

  const onEvent = useCallback((event: BotSearchEvent) => {
    setProgress((prev) => applyBotSearchEvent(prev, event))
  }, [])

  const startSearch = useCallback(async (game: SteamApp, cardType: CardType) => {
    setSelectedGame(game)
    setResults([])
    setProgress({ ...initialSearchProgress, status: 'loading-bots' })

    const client = createApiClient()
    const service = new BotSearchService(client, {
      onEvent,
      onMatch: (match) => {
        setResults((prev) => [...prev, match])
      },
    })

    serviceRef.current = service
    await service.start({ gameAppId: game.appid, cardType })
  }, [onEvent])

  const pause = useCallback(() => serviceRef.current?.pause(), [])
  const resume = useCallback(() => serviceRef.current?.resume(), [])
  const stop = useCallback(() => serviceRef.current?.stop(), [])

  const isSearching =
    progress.status === 'loading-bots' ||
    progress.status === 'searching' ||
    progress.status === 'paused'

  return {
    progress,
    results,
    selectedGame,
    startSearch,
    pause,
    resume,
    stop,
    isSearching,
    isPaused: progress.status === 'paused',
  }
}
