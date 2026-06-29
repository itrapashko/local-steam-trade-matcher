import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { SteamApp } from '../types/steam'

interface GameSelectorProps {
  apps: SteamApp[]
  loading: boolean
  error: string | null
  disabled: boolean
  onSearch: (query: string) => SteamApp[]
  onSelect: (app: SteamApp) => void
  selected: SteamApp | null
}

export function GameSelector({
  apps,
  loading,
  error,
  disabled,
  onSearch,
  onSelect,
  selected,
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
      <h2>Выбор игры</h2>
      <p className="hint">
        Введите AppID или название игры. AppID можно указать вручную, даже если игры нет в списке Steam.
      </p>
      {loading && <p className="status">Загрузка списка игр…</p>}
      {error && <p className="error">{error}</p>}
      <div className="game-selector" ref={containerRef}>
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder="Например: 263280 или WAVESHAPER"
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
          Выбрано: <strong>{selected.name}</strong> (AppID {selected.appid})
        </p>
      )}
    </section>
  )
}
