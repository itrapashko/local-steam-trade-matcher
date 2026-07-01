import { useState } from 'react'
import { GameSelector } from './components/GameSelector'
import { BotResultList } from './components/BotResultList'
import { SearchControls } from './components/SearchControls'
import { SearchProgressBar } from './components/SearchProgress'
import { useAppList, useBotSearch } from './hooks/useBotSearch'
import type { SteamApp } from './types/steam'
import './App.css'

const GITHUB_REPO_URL = 'https://github.com/itrapashko/local-steam-trade-matcher'

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

  function handleStart() {
    if (!game) {
      return
    }
    void startSearch(game)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Local Steam Trade Matcher</h1>
          <p className="subtitle">
            Find ASF bots with trading cards for a selected game
          </p>
        </div>
        <a
          className="header-link"
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
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
      </main>

      <footer className="app-footer">
        <p>
          Bot data:{' '}
          <a href="https://asf.justarchi.net/Api/Listing/Bots" target="_blank" rel="noreferrer">
            ASF Listing API
          </a>
        </p>
        {selectedGame && progress.status === 'done' && (
          <p>Search for {selectedGame.name} finished.</p>
        )}
      </footer>
    </div>
  )
}
