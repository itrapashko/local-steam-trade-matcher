import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { GameCardStatus } from '../hooks/useBotSearch'
import type { SteamApp } from '../types/steam'

interface GameSelectorProps {
  apps: SteamApp[]
  loading: boolean
  error: string | null
  disabled: boolean
  onSearch: (query: string) => SteamApp[]
  onSelect: (app: SteamApp) => void
  selected: SteamApp | null
  cardStatus: GameCardStatus
  cardError: string | null
}

export function GameSelector({
  apps,
  loading,
  error,
  disabled,
  onSearch,
  onSelect,
  selected,
  cardStatus,
  cardError,
}: GameSelectorProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SteamApp[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected) {
      setQuery(`${selected.name} (${selected.appid})`)
    }
  }, [selected])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    const matches = onSearch(value)
    setSuggestions(matches)
    setOpen(matches.length > 0)

    if (/^\d+$/.test(value.trim())) {
      const appId = Number(value.trim())
      const app = apps.find((item) => item.appid === appId)
      if (app) {
        onSelect(app)
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || suggestions.length === 0) {
      return
    }
    event.preventDefault()
    pickApp(suggestions[0])
  }

  function pickApp(app: SteamApp) {
    onSelect(app)
    setQuery(`${app.name} (${app.appid})`)
    setOpen(false)
  }

  return (
    <section className="panel">
      <h2>Select game</h2>
      <p className="hint">
        Enter an AppID or game name. You can type an AppID manually even if the game is not in the Steam list.
      </p>
      {loading && <p className="status">Loading game list…</p>}
      {error && <p className="error">{error}</p>}
      <div className="game-selector" ref={containerRef}>
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder="e.g. 263280 or WAVESHAPER"
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
        />
        {open && suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((app) => (
              <li key={app.appid}>
                <button type="button" onClick={() => pickApp(app)}>
                  <span className="app-name">{app.name}</span>
                  <span className="app-id">{app.appid}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selected && (
        <p className="selected-game">
          Selected: <strong>{selected.name}</strong> (AppID {selected.appid})
        </p>
      )}
      {cardStatus === 'checking' && (
        <p className="status">Checking for trading cards…</p>
      )}
      {cardStatus === 'has-cards' && selected && (
        <p className="status">This game has Steam trading cards.</p>
      )}
      {cardStatus === 'no-cards' && (
        <p className="error">This game does not have Steam trading cards.</p>
      )}
      {cardStatus === 'error' && cardError && (
        <p className="error">{cardError}</p>
      )}
    </section>
  )
}
