interface SearchControlsProps {
  canStart: boolean
  isSearching: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function SearchControls({
  canStart,
  isSearching,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
}: SearchControlsProps) {
  return (
    <section className="panel controls">
      <h2>Поиск ботов</h2>
      <div className="button-row">
        <button type="button" disabled={!canStart || isSearching} onClick={onStart}>
          Начать поиск
        </button>
        <button
          type="button"
          disabled={!isSearching || isPaused}
          onClick={onPause}
        >
          Пауза
        </button>
        <button type="button" disabled={!isPaused} onClick={onResume}>
          Продолжить
        </button>
        <button
          type="button"
          disabled={!isSearching && !isPaused}
          onClick={onStop}
          className="secondary"
        >
          Остановить
        </button>
      </div>
    </section>
  )
}
