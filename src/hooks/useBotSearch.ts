import { useCallback, useEffect, useRef, useState } from 'react'
import { createApiClient } from '../api/client'
import { findAppById, loadAppList, searchApps } from '../api/appList'
import { fetchGameSetCards } from '../api/gameCards'
import { BotSearchService } from '../services/botSearch'
import type { GameSetCard } from '../services/parseGameCardsHtml'
import type { SteamApp, BotMatchResult, SearchProgress } from '../types/steam'
import { REFERENCE_STEAM_ID } from '../utils/steamId'

export type GameCardStatus = 'idle' | 'checking' | 'has-cards' | 'no-cards' | 'error'

const initialProgress: SearchProgress = {
  checked: 0,
  total: 0,
  found: 0,
  currentBotNickname: null,
  status: 'idle',
  errorMessage: null,
}

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

export function useGameCardCheck(game: SteamApp | null) {
  const [cardStatus, setCardStatus] = useState<GameCardStatus>('idle')
  const [cardError, setCardError] = useState<string | null>(null)
  const [gameCards, setGameCards] = useState<GameSetCard[]>([])

  useEffect(() => {
    if (!game) {
      setCardStatus('idle')
      setCardError(null)
      setGameCards([])
      return
    }

    let cancelled = false
    setCardStatus('checking')
    setCardError(null)
    setGameCards([])

    const client = createApiClient()
    fetchGameSetCards(client, REFERENCE_STEAM_ID, game.appid)
      .then((cards) => {
        if (!cancelled) {
          if (cards) {
            setGameCards(cards)
            setCardStatus('has-cards')
          } else {
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

    return () => {
      cancelled = true
    }
  }, [game])

  return { cardStatus, cardError, gameCards }
}

export function useBotSearch() {
  const serviceRef = useRef<BotSearchService | null>(null)
  const [progress, setProgress] = useState<SearchProgress>(initialProgress)
  const [results, setResults] = useState<BotMatchResult[]>([])
  const [selectedGame, setSelectedGame] = useState<SteamApp | null>(null)

  const startSearch = useCallback(async (game: SteamApp) => {
    setSelectedGame(game)
    setResults([])
    setProgress({ ...initialProgress, status: 'loading-bots' })

    const client = createApiClient()
    const service = new BotSearchService(client, {
      onProgress: setProgress,
      onMatch: (match) => {
        setResults((prev) => [...prev, match])
      },
    })

    serviceRef.current = service
    await service.start({ gameAppId: game.appid })
  }, [])

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
