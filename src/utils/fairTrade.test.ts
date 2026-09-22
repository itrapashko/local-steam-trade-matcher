import { describe, expect, it } from 'vitest'
import type { OwnedGameCard } from '../types/steam'
import {
  botCanGiveRelevantCards,
  fairBotWillGiveCard,
  smallestSetQuantity,
} from './fairTrade'

function cards(
  quantities: number[],
  setSize = quantities.length,
): OwnedGameCard[] {
  return quantities.map((quantity, i) => ({
    name: `Card ${i + 1}`,
    imageUrl: null,
    index: i + 1,
    setSize,
    quantity,
  }))
}

describe('smallestSetQuantity', () => {
  it('uses zero when the bot is missing cards from the set', () => {
    expect(smallestSetQuantity(cards([1, 2, 1], 5))).toBe(0)
  })

  it('uses the smallest owned amount when the set is complete', () => {
    expect(smallestSetQuantity(cards([1, 1, 2, 1, 1]))).toBe(1)
    expect(smallestSetQuantity(cards([2, 2, 2]))).toBe(2)
  })
})

describe('fairBotWillGiveCard', () => {
  it('withholds cards tied for the smallest amount in a full set', () => {
    const set = cards([1, 1, 2, 1, 1])
    expect(set.map((card) => fairBotWillGiveCard(set, card))).toEqual([
      false,
      false,
      true,
      false,
      false,
    ])
  })

  it('withholds every card when all amounts are equal', () => {
    const set = cards([2, 2, 2])
    expect(set.every((card) => !fairBotWillGiveCard(set, card))).toBe(true)
  })

  it('allows every owned card when a smaller missing card exists', () => {
    const set = cards([1, 2, 1], 5)
    expect(set.every((card) => fairBotWillGiveCard(set, card))).toBe(true)
  })
})

describe('botCanGiveRelevantCards', () => {
  const fullSet = cards([1, 1, 2, 1, 1])

  it('lets Any-mode bots give every owned card', () => {
    expect(botCanGiveRelevantCards(fullSet, 'Any', [])).toBe(true)
    expect(botCanGiveRelevantCards(fullSet, 'Any', ['Card 1'])).toBe(true)
  })

  it('hides a Fair bot that cannot give any relevant card', () => {
    expect(botCanGiveRelevantCards(fullSet, 'Fair', ['Card 1', 'Card 2'])).toBe(false)
    expect(botCanGiveRelevantCards(cards([1, 1, 1]), 'Fair', [])).toBe(false)
  })

  it('keeps a Fair bot that can give at least one relevant card', () => {
    expect(botCanGiveRelevantCards(fullSet, 'Fair', [])).toBe(true)
    expect(botCanGiveRelevantCards(fullSet, 'Fair', ['Card 1', 'Card 3'])).toBe(true)
  })
})
