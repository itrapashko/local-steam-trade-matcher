import type { CardType } from '../types/steam'

interface CardTypeSelectorProps {
  value: CardType
  onChange: (value: CardType) => void
  disabled: boolean
}

export function CardTypeSelector({ value, onChange, disabled }: CardTypeSelectorProps) {
  return (
    <label className={`filter-toggle${disabled ? ' disabled' : ''}`}>
      <input
        type="checkbox"
        className="filter-toggle-input"
        checked={value === 'foil'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked ? 'foil' : 'regular')}
      />
      <span className="filter-toggle-track" aria-hidden>
        <span className="filter-toggle-thumb" />
      </span>
      <span className="filter-toggle-label">Foil cards</span>
    </label>
  )
}
