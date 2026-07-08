import { useMemo } from 'react'
import type { BotMatchResult } from '../types/steam'
import { filterBotResults } from '../utils/filterResults'
import { BotResultCard } from './BotResultCard'

interface BotResultListProps {
  results: BotMatchResult[]
  anyModeOnly: boolean
  selectedCardNames: string[]
}

export function BotResultList({
  results,
  anyModeOnly,
  selectedCardNames,
}: BotResultListProps) {
  const filteredResults = useMemo(
    () => filterBotResults(results, { anyModeOnly, selectedCardNames }),
    [results, anyModeOnly, selectedCardNames],
  )

  if (results.length === 0) {
    return null
  }

  const title =
    filteredResults.length === results.length
      ? `Matching bots (${results.length})`
      : `Matching bots (${filteredResults.length} of ${results.length})`

  return (
    <section className="panel results-panel">
      <h2>{title}</h2>
      {filteredResults.length === 0 ? (
        <p className="status">No bots match the current filters.</p>
      ) : (
        <div className="results-list">
          {filteredResults.map((result) => (
            <BotResultCard
              key={result.bot.SteamIDText}
              result={result}
              selectedCardNames={selectedCardNames}
            />
          ))}
        </div>
      )}
    </section>
  )
}
