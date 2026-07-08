import { useCallback, useEffect, useRef } from 'react'
import { trackGoogleAnalyticsEvent } from '../analytics/gtag'
import type { SearchProgress } from '../types/steam'

function trackTerminalSearchStatus(
  progress: SearchProgress,
  durationMs: number | null,
): boolean {
  if (progress.status === 'done') {
    trackGoogleAnalyticsEvent('search_done', {
      checked: progress.checked,
      total: progress.total,
      found: progress.found,
      duration_ms: durationMs,
    })
    return true
  }

  if (progress.status === 'stopped') {
    trackGoogleAnalyticsEvent('search_stopped', {
      checked: progress.checked,
      total: progress.total,
      found: progress.found,
      duration_ms: durationMs,
    })
    return true
  }

  if (progress.status === 'error') {
    trackGoogleAnalyticsEvent('search_error', {
      checked: progress.checked,
      total: progress.total,
      found: progress.found,
      duration_ms: durationMs,
      message_length: progress.errorMessage?.length ?? 0,
    })
    return true
  }

  return false
}

/**
 * Tracks bot-search lifecycle analytics based on `progress` transitions.
 * Call `markBotSearchStarted()` when a new search run begins (to measure duration).
 */
export function useBotSearchAnalytics(progress: SearchProgress) {
  const startedAtRef = useRef<number | null>(null)
  const prevStatusRef = useRef<SearchProgress['status']>(progress.status)

  const markBotSearchStarted = useCallback(() => {
    startedAtRef.current = Date.now()
    prevStatusRef.current = 'loading-bots'
  }, [])

  useEffect(() => {
    const prevStatus = prevStatusRef.current
    const nextStatus = progress.status
    if (prevStatus === nextStatus) {
      return
    }

    prevStatusRef.current = nextStatus
    const startedAt = startedAtRef.current
    const durationMs = startedAt ? Math.max(0, Date.now() - startedAt) : null

    const wasTerminal = trackTerminalSearchStatus(progress, durationMs)
    if (wasTerminal) {
      startedAtRef.current = null
    }
  }, [progress])

  return { markBotSearchStarted }
}

