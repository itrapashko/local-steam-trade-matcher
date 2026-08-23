import type { GameSetCard, OwnedGameCard } from '../types/steam'

export function parseQuantity(text: string | null | undefined): number {
  if (!text) {
    return 1
  }
  const match = text.match(/\((\d+)\)/)
  return match ? Number(match[1]) : 1
}

function parseCardName(titleElement: Element | null): string | null {
  if (!titleElement) {
    return null
  }
  const name = titleElement.textContent
    ?.replace(/\(\d+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return name || null
}

function parseCardSetPosition(element: Element): { index: number; setSize: number } | null {
  const texts = element.querySelectorAll('.badge_card_set_text:not(.badge_card_set_title)')
  for (const textEl of texts) {
    const match = textEl.textContent?.match(/(\d+)\s+of\s+(\d+)/i)
    if (match) {
      return { index: Number(match[1]), setSize: Number(match[2]) }
    }
  }
  return null
}

interface ParsedGameCard extends OwnedGameCard {
  owned: boolean
}

function parseAllGameCards(html: string): ParsedGameCard[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const elements = doc.querySelectorAll('.badge_card_set_card')
  const fallbackSetSize = elements.length
  const cards: ParsedGameCard[] = []

  elements.forEach((element, i) => {
    const name = parseCardName(element.querySelector('.badge_card_set_title'))
    if (!name) {
      return
    }

    const owned = element.classList.contains('owned')
    const quantityText = element.querySelector('.badge_card_set_text_qty')?.textContent
    const quantity = owned ? parseQuantity(quantityText) : 0
    const imageUrl = element.querySelector('img.gamecard')?.getAttribute('src') ?? null
    const position = parseCardSetPosition(element)

    cards.push({
      name,
      imageUrl,
      quantity,
      owned,
      index: position?.index ?? i + 1,
      setSize: position?.setSize ?? fallbackSetSize,
    })
  })

  return cards
}

export function parseOwnedGameHtml(html: string): OwnedGameCard[] {
  return parseAllGameCards(html)
    .filter((card) => card.owned && card.quantity > 0)
    .map(({ owned: _, ...card }) => card)
}

export function parseGameSetCards(html: string): GameSetCard[] {
  return parseAllGameCards(html).map(({ name, imageUrl, index, setSize }) => ({
    name,
    imageUrl,
    index,
    setSize,
  }))
}

export function totalCardCount(cards: OwnedGameCard[]): number {
  return cards.reduce((sum, card) => sum + card.quantity, 0)
}

export function gameHasTradingCards(html: string): boolean {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.querySelectorAll('.badge_card_set_card').length > 0
}
