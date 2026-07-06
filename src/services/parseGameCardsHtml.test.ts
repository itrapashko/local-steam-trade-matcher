import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  gameHasTradingCards,
  parseGameCardsHtml,
  parseGameSetCards,
  parseQuantity,
  totalCardCount,
} from './parseGameCardsHtml'

const fixtureDir = dirname(fileURLToPath(import.meta.url))

const sampleHtml = `
<div class="badge_card_set_cards">
  <div class="badge_card_set_card owned">
    <div class="game_card_ctn">
      <img class="gamecard" src="https://example.com/triangle.png">
      <div class="badge_card_set_text badge_card_set_title ellipsis">Triangle</div>
      <div class="badge_card_set_text_qty">(1)</div>
    </div>
  </div>
  <div class="badge_card_set_card owned">
    <div class="game_card_ctn">
      <img class="gamecard" src="https://example.com/square.png">
      <div class="badge_card_set_text badge_card_set_title ellipsis">Square</div>
      <div class="badge_card_set_text_qty">(6)</div>
    </div>
  </div>
  <div class="badge_card_set_card unowned">
    <div class="game_card_ctn">
      <img class="gamecard" src="https://example.com/player.png">
      <div class="badge_card_set_text badge_card_set_title ellipsis">Player</div>
    </div>
  </div>
</div>
`

describe('parseQuantity', () => {
  it('parses parenthesized counts', () => {
    expect(parseQuantity('(6)')).toBe(6)
    expect(parseQuantity('(0)')).toBe(0)
    expect(parseQuantity('')).toBe(1)
    expect(parseQuantity(undefined)).toBe(1)
  })
})

describe('parseGameSetCards', () => {
  it('returns all cards in the set, owned and unowned', () => {
    const cards = parseGameSetCards(sampleHtml)
    expect(cards).toHaveLength(3)
    expect(cards[0]).toEqual({
      name: 'Triangle',
      imageUrl: 'https://example.com/triangle.png',
    })
    expect(cards[2]).toEqual({
      name: 'Player',
      imageUrl: 'https://example.com/player.png',
    })
  })

  it('parses full card set from real Steam layout', () => {
    const html = readFileSync(
      join(fixtureDir, '../test-fixtures/fancy-gamecards.html'),
      'utf-8',
    )
    const cards = parseGameSetCards(html)
    expect(cards.map((c) => c.name)).toEqual([
      'Triangle',
      'Square',
      'Player',
      'Line',
      'Void',
    ])
  })

  it('parses foil card set from real Steam layout', () => {
    const html = readFileSync(
      join(fixtureDir, '../test-fixtures/spintires-foil-gamecards.html'),
      'utf-8',
    )
    const cards = parseGameSetCards(html)
    expect(cards.map((c) => c.name)).toEqual([
      'I Love My Winch',
      'Into the Mud',
      'Loading Logs',
      'Saving the Day',
      'Fuel Demon',
      'Recovery Giant',
      'Monster in the Forest',
    ])
  })
})

describe('parseGameCardsHtml', () => {
  it('returns only owned cards with names, quantities and images', () => {
    const cards = parseGameCardsHtml(sampleHtml)
    expect(cards).toHaveLength(2)
    expect(cards[0]).toEqual({
      name: 'Triangle',
      quantity: 1,
      imageUrl: 'https://example.com/triangle.png',
    })
    expect(cards[1]).toEqual({
      name: 'Square',
      quantity: 6,
      imageUrl: 'https://example.com/square.png',
    })
  })

  it('returns empty array when no owned cards', () => {
    const html = '<div class="badge_card_set_card unowned"><span class="badge_card_set_title">X</span></div>'
    expect(parseGameCardsHtml(html)).toEqual([])
  })

  it('ignores owned badge slots with zero cards (Sorcerer case)', () => {
    const html = readFileSync(
      join(fixtureDir, '../test-fixtures/sorcerer-gamecards.html'),
      'utf-8',
    )
    expect(parseGameCardsHtml(html)).toEqual([])
  })

  it('parses real Steam layout with qty inside title (Fancy case)', () => {
    const html = readFileSync(
      join(fixtureDir, '../test-fixtures/fancy-gamecards.html'),
      'utf-8',
    )
    const cards = parseGameCardsHtml(html)
    expect(cards).toHaveLength(3)
    expect(cards.map((c) => c.name)).toEqual(['Square', 'Player', 'Line'])
    expect(cards.map((c) => c.quantity)).toEqual([1, 2, 1])
  })

  it('parses foil cards from real Steam layout', () => {
    const html = readFileSync(
      join(fixtureDir, '../test-fixtures/spintires-foil-gamecards.html'),
      'utf-8',
    )
    const cards = parseGameCardsHtml(html)
    expect(cards).toHaveLength(1)
    expect(cards[0]).toMatchObject({ name: 'Loading Logs', quantity: 1 })
  })
})

describe('totalCardCount', () => {
  it('sums quantities', () => {
    expect(
      totalCardCount([
        { name: 'A', quantity: 2, imageUrl: null },
        { name: 'B', quantity: 3, imageUrl: null },
      ]),
    ).toBe(5)
  })
})

describe('gameHasTradingCards', () => {
  it('returns true when the page has card slots', () => {
    expect(gameHasTradingCards(sampleHtml)).toBe(true)
  })

  it('returns true for unowned-only card sets', () => {
    const html = '<div class="badge_card_set_card unowned"><span class="badge_card_set_title">X</span></div>'
    expect(gameHasTradingCards(html)).toBe(true)
  })

  it('returns false when Steam redirects to the badges overview', () => {
    const html = '<title>Steam Community :: Steam Badges</title><div class="badge_row"></div>'
    expect(gameHasTradingCards(html)).toBe(false)
  })

  it('returns true for real Steam gamecards layout', () => {
    const html = readFileSync(
      join(fixtureDir, '../test-fixtures/fancy-gamecards.html'),
      'utf-8',
    )
    expect(gameHasTradingCards(html)).toBe(true)
  })

  it('returns true for foil gamecards layout', () => {
    const html = readFileSync(
      join(fixtureDir, '../test-fixtures/spintires-foil-gamecards.html'),
      'utf-8',
    )
    expect(gameHasTradingCards(html)).toBe(true)
  })
})
