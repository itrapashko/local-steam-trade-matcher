import type { OwnedGameCard } from '../types/steam'

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

export function parseGameCardsHtml(html: string): OwnedGameCard[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const ownedElements = doc.querySelectorAll('.badge_card_set_card.owned')

  const cards: OwnedGameCard[] = []
  ownedElements.forEach((element) => {
    const quantityText = element.querySelector('.badge_card_set_text_qty')?.textContent
    const quantity = parseQuantity(quantityText)
    if (quantity <= 0) {
      return
    }

    const name = parseCardName(element.querySelector('.badge_card_set_title'))
    if (!name) {
      return
    }

    const imageUrl = element.querySelector('img.gamecard')?.getAttribute('src') ?? null

    cards.push({
      name,
      quantity,
      imageUrl,
    })
  })

  return cards
}

export function totalCardCount(cards: OwnedGameCard[]): number {
  return cards.reduce((sum, card) => sum + card.quantity, 0)
}

export function gameHasTradingCards(html: string): boolean {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.querySelectorAll('.badge_card_set_card').length > 0
}
