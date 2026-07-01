import type { SteamApp } from '../types/steam'
import type { FilterCardOption } from '../utils/filterResults'
import { ResultFilters } from './ResultFilters'

interface SearchSettingsProps {
  game: SteamApp
  gameCards: FilterCardOption[]
  anyModeOnly: boolean
  onAnyModeOnlyChange: (value: boolean) => void
  selectedCardNames: string[]
  onSelectedCardNamesChange: (names: string[]) => void
}

export function SearchSettings({
  game,
  gameCards,
  anyModeOnly,
  onAnyModeOnlyChange,
  selectedCardNames,
  onSelectedCardNamesChange,
}: SearchSettingsProps) {
  return (
    <section className="panel">
      <h2>Search settings</h2>
      <ResultFilters
        anyModeOnly={anyModeOnly}
        onAnyModeOnlyChange={onAnyModeOnlyChange}
        cards={gameCards}
        selectedCardNames={selectedCardNames}
        onSelectedCardNamesChange={onSelectedCardNamesChange}
      />
      <p className="status">Configure filters, then start the search for {game.name}.</p>
    </section>
  )
}
