import type { BotMatchResult } from '../types/steam'
import { BotResultCard } from './BotResultCard'

interface BotResultListProps {
  results: BotMatchResult[]
}

export function BotResultList({ results }: BotResultListProps) {
  if (results.length === 0) {
    return null
  }

  return (
    <section className="panel results-panel">
      <h2>Matching bots ({results.length})</h2>
      <div className="results-list">
        {results.map((result) => (
          <BotResultCard key={result.bot.SteamIDText} result={result} />
        ))}
      </div>
    </section>
  )
}
