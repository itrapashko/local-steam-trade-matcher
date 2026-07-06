import type { CardType, SteamApp } from '../types/steam'
import type { FilterCardOption } from '../utils/filterResults'
import { ResultFilters } from './ResultFilters'

interface SearchSettingsProps {
  game: SteamApp
  gameCards: FilterCardOption[]
  cardType: CardType
  onCardTypeChange: (value: CardType) => void
  cardTypeDisabled: boolean
  showCardFilters: boolean
  anyModeOnly: boolean
  onAnyModeOnlyChange: (value: boolean) => void
  selectedCardNames: string[]
  onSelectedCardNamesChange: (names: string[]) => void
}

export function SearchSettings({
  game,
  gameCards,
  cardType,
  onCardTypeChange,
  cardTypeDisabled,
  showCardFilters,
  anyModeOnly,
  onAnyModeOnlyChange,
  selectedCardNames,
  onSelectedCardNamesChange,
}: SearchSettingsProps) {
  return (
    <section className="panel">
      <h2>Search settings</h2>
      <ResultFilters
        cardType={cardType}
        onCardTypeChange={onCardTypeChange}
        cardTypeDisabled={cardTypeDisabled}
        showCardFilters={showCardFilters}
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