import { useState } from 'react'
import { GameSelector } from './components/GameSelector'
import { BotResultList } from './components/BotResultList'
import { SearchControls } from './components/SearchControls'
import { SearchProgressBar } from './components/SearchProgress'
import { SearchSettings } from './components/SearchSettings'
import { trackGoogleAnalyticsEvent } from './analytics/gtag'
import { useAppList, useBotSearch, useGameCardCheck } from './hooks/useBotSearch'
import { useSearchFilters } from './hooks/useSearchFilters'
import type { SteamApp } from './types/steam'
import './App.css'

const GITHUB_REPO_URL = 'https://github.com/itrapashko/local-steam-trade-matcher'
const ASF_STM_URL = 'https://asf.justarchi.net/STM'
const GAME_DATA_REPO_URL = 'https://github.com/jsnli/steamappidlist'

export default function App() {
  const { apps, loading, error, searchApps } = useAppList()
  const {
    progress,
    results,
    startSearch,
    pause,
    resume,
    stop,
    isSearching,
    isPaused,
  } = useBotSearch()

  const [game, setGame] = useState<SteamApp | null>(null)
  const {
    cardType,
    setCardType,
    anyModeOnly,
    setAnyModeOnly,
    selectedCardNames,
    setSelectedCardNames,
  } = useSearchFilters(game?.appid ?? null)
  const { cardStatus, cardError, gameCards, showCardFilters, cardsLoading } =
    useGameCardCheck(game, cardType)

  function handleSelectGame(app: SteamApp) {
    setGame(app)
    trackGoogleAnalyticsEvent('select_game', { app_id: app.appid })
  }

  function handleCardTypeChange(value: 'regular' | 'foil') {
    setCardType(value)
    trackGoogleAnalyticsEvent('set_card_type', { value })
  }

  function handleAnyModeOnlyChange(value: boolean) {
    setAnyModeOnly(value)
    trackGoogleAnalyticsEvent('set_any_mode_only', { value })
  }

  function handleSelectedCardNamesChange(names: string[]) {
    setSelectedCardNames(names)
    trackGoogleAnalyticsEvent('set_card_filters', { selected_count: names.length })
  }

  function handleStart() {
    if (!game) {
      return
    }
    trackGoogleAnalyticsEvent('search_start', { app_id: game.appid, card_type: cardType })
    void startSearch(game, cardType)
  }

  function handlePause() {
    trackGoogleAnalyticsEvent('search_pause')
    pause()
  }

  function handleResume() {
    trackGoogleAnalyticsEvent('search_resume')
    resume()
  }

  function handleStop() {
    trackGoogleAnalyticsEvent('search_stop')
    stop()
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Local Steam Trade Matcher</h1>
          <p className="subtitle">
            Trade your duplicate regular or foil Steam trading cards with bots for a selected
            game. A local alternative to Steam Trade Matcher without queues.
          </p>
        </div>
        <div className="header-links">
          <a
            className="header-link"
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackGoogleAnalyticsEvent('outbound_click', { target: 'github' })}
          >
            GitHub
          </a>
          <a
            className="header-link"
            href={GAME_DATA_REPO_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackGoogleAnalyticsEvent('outbound_click', { target: 'game_data' })}
          >
            Game data
          </a>
          <a
            className="header-link"
            href={ASF_STM_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackGoogleAnalyticsEvent('outbound_click', { target: 'bot_data' })}
          >
            Bot data
          </a>
        </div>
      </header>

      <main className="app-main">
        <GameSelector
          apps={apps}
          loading={loading}
          error={error}
          disabled={isSearching}
          onSearch={searchApps}
          onSelect={handleSelectGame}
          selected={game}
          cardStatus={cardStatus}
          cardError={cardError}
        />

        {game && (
          <SearchSettings
            game={game}
            gameCards={gameCards}
            cardType={cardType}
            onCardTypeChange={handleCardTypeChange}
            cardTypeDisabled={isSearching}
            showCardFilters={showCardFilters}
            anyModeOnly={anyModeOnly}
            onAnyModeOnlyChange={handleAnyModeOnlyChange}
            selectedCardNames={selectedCardNames}
            onSelectedCardNamesChange={handleSelectedCardNamesChange}
          />
        )}

        <SearchControls
          canStart={!!game && cardStatus === 'has-cards' && !cardsLoading}
          isSearching={isSearching}
          isPaused={isPaused}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
        />

        <SearchProgressBar progress={progress} />

        <BotResultList
          results={results}
          anyModeOnly={anyModeOnly}
          selectedCardNames={selectedCardNames}
        />
      </main>
    </div>
  )
}
