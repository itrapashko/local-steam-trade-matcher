import type { SearchProgress } from '../types/steam'

interface SearchProgressProps {
  progress: SearchProgress
}

const statusLabels: Record<SearchProgress['status'], string> = {
  idle: 'Idle',
  'loading-bots': 'Loading bot list…',
  searching: 'Searching…',
  paused: 'Paused',
  done: 'Done',
  stopped: 'Stopped',
  error: 'Error',
}

export function SearchProgressBar({ progress }: SearchProgressProps) {
  const { checked, total, found, currentBotNickname, status, errorMessage } = progress
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0
  const showBar = status !== 'idle'

  if (!showBar) {
    return null
  }

  return (
    <section className="panel progress-panel">
      <div className="progress-header">
        <span className="status-label">{statusLabels[status]}</span>
        {total > 0 && (
          <span className="progress-counts">
            {checked} / {total} · found: {found}
          </span>
        )}
      </div>
      {total > 0 && (
        <div className="progress-track" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      )}
      {currentBotNickname && status === 'searching' && (
        <p className="current-bot">Checking: {currentBotNickname}</p>
      )}
      {errorMessage && (
        <p className="error">{errorMessage}</p>
      )}
    </section>
  )
}
