import type { FilterCardOption } from '../utils/filterResults'

interface ResultFiltersProps {
  anyModeOnly: boolean
  onAnyModeOnlyChange: (value: boolean) => void
  cards: FilterCardOption[]
  selectedCardNames: string[]
  onSelectedCardNamesChange: (names: string[]) => void
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
      <path
        fill="currentColor"
        d="M10.2 2.4 4.8 8.4 1.8 5.4l-.9.9 3.9 3.9 6.3-6.6-.9-.6Z"
      />
    </svg>
  )
}

export function ResultFilters({
  anyModeOnly,
  onAnyModeOnlyChange,
  cards,
  selectedCardNames,
  onSelectedCardNamesChange,
}: ResultFiltersProps) {
  function toggleCard(name: string) {
    if (selectedCardNames.includes(name)) {
      onSelectedCardNamesChange(selectedCardNames.filter((n) => n !== name))
    } else {
      onSelectedCardNamesChange([...selectedCardNames, name])
    }
  }

  function clearCardSelection() {
    onSelectedCardNamesChange([])
  }

  return (
    <div className="result-filters">
      <label className="filter-toggle">
        <input
          type="checkbox"
          className="filter-toggle-input"
          checked={anyModeOnly}
          onChange={(e) => onAnyModeOnlyChange(e.target.checked)}
        />
        <span className="filter-toggle-track" aria-hidden>
          <span className="filter-toggle-thumb" />
        </span>
        <span className="filter-toggle-label">
          Only bots with <span className="trade-mode trade-mode-any">Any</span> trade mode
        </span>
      </label>

      {cards.length > 0 && (
        <fieldset className="card-filter">
          <legend>Filter by cards</legend>
          <p className="filter-hint">
            Show bots that have at least one selected card.
            {selectedCardNames.length > 0 && (
              <button
                type="button"
                className="filter-clear"
                onClick={clearCardSelection}
              >
                Clear selection
              </button>
            )}
          </p>
          <div className="card-filter-grid">
            {cards.map((card) => {
              const selected = selectedCardNames.includes(card.name)
              return (
                <button
                  key={card.name}
                  type="button"
                  className={`card-filter-tile${selected ? ' selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => toggleCard(card.name)}
                >
                  <span className="card-filter-tile-check" aria-hidden>
                    <CheckIcon />
                  </span>
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt=""
                      className="card-filter-tile-image"
                    />
                  ) : (
                    <span className="card-filter-tile-placeholder" aria-hidden />
                  )}
                  <span className="card-filter-tile-name">{card.name}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      )}
    </div>
  )
}
