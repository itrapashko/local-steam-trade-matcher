import { useState } from 'react'
import { getProxyBaseUrl, setProxyBaseUrl } from './api/client'
import { GameSelector } from './components/GameSelector'
import { BotResultList } from './components/BotResultList'
import { SearchControls } from './components/SearchControls'
import { SearchProgressBar } from './components/SearchProgress'
import { useAppList, useBotSearch } from './hooks/useBotSearch'
import type { SteamApp } from './types/steam'
import './App.css'

export default function App() {
  const { apps, loading, error, searchApps } = useAppList()
  const {
    progress,
    results,
    selectedGame,
    startSearch,
    pause,
    resume,
    stop,
    isSearching,
    isPaused,
  } = useBotSearch()

  const [game, setGame] = useState<SteamApp | null>(null)
  const [proxyUrl, setProxyUrl] = useState(getProxyBaseUrl)

  function handleStart() {
    if (!game) {
      return
    }
    void startSearch(game)
  }

  function saveProxy() {
    setProxyBaseUrl(proxyUrl)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Local Steam Trade Matcher</h1>
          <p className="subtitle">
            Поиск ASF-ботов с карточками выбранной игры
          </p>
        </div>
        <a
          href="https://asf.justarchi.net/STM"
          target="_blank"
          rel="noreferrer"
          className="stm-link"
        >
          ASF STM
        </a>
      </header>

      <main className="app-main">
        <GameSelector
          apps={apps}
          loading={loading}
          error={error}
          disabled={isSearching}
          onSearch={searchApps}
          onSelect={setGame}
          selected={game}
        />

        <SearchControls
          canStart={!!game}
          isSearching={isSearching}
          isPaused={isPaused}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onStop={stop}
        />

        <SearchProgressBar progress={progress} />

        <BotResultList results={results} />

        <section className="panel settings-panel">
          <h2>Настройки</h2>
          <p className="hint">
            URL прокси для GitHub Pages (Cloudflare Worker). В dev оставьте пустым — используется Vite proxy.
          </p>
          <div className="proxy-row">
            <input
              type="url"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="https://your-worker.example.com"
              disabled={isSearching}
            />
            <button type="button" onClick={saveProxy} disabled={isSearching}>
              Сохранить
            </button>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Данные ботов:{' '}
          <a href="https://asf.justarchi.net/Api/Listing/Bots" target="_blank" rel="noreferrer">
            ASF Listing API
          </a>
        </p>
        {selectedGame && progress.status === 'done' && (
          <p>Поиск по игре {selectedGame.name} завершён.</p>
        )}
      </footer>
    </div>
  )
}
