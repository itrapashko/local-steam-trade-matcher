import type { TradeMode } from '../types/asf'
import type { OwnedGameCard } from '../types/steam'

/**
 * Smallest amount in the set. Cards the bot does not own count as zero when
 * the owned list is shorter than the set, so an incomplete set never locks a card.
 */
export function smallestSetQuantity(cards: readonly OwnedGameCard[]): number {
  if (cards.length === 0) {
    return 0
  }

  const setSize = cards.reduce((size, card) => Math.max(size, card.setSize), 0)
  if (cards.length < setSize) {
    return 0
  }

  return cards.reduce(
    (smallest, card) => Math.min(smallest, card.quantity),
    cards[0]!.quantity,
  )
}

/** Fair mode gives a card only when some other card in the set has a smaller amount. */
export function fairBotWillGiveCard(
  cards: readonly OwnedGameCard[],
  card: OwnedGameCard,
): boolean {
  return card.quantity > smallestSetQuantity(cards)
}

export function botCanGiveRelevantCards(
  cards: readonly OwnedGameCard[],
  tradeMode: TradeMode,
  selectedCardNames: readonly string[],
): boolean {
  const selected =
    selectedCardNames.length > 0 ? new Set(selectedCardNames) : null
  const relevant = selected ? cards.filter((card) => selected.has(card.name)) : cards
  if (relevant.length === 0) {
    return false
  }
  if (tradeMode === 'Any') {
    return true
  }
  return relevant.some((card) => fairBotWillGiveCard(cards, card))
}
