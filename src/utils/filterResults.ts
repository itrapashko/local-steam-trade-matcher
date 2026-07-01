import { getBotTradeMode } from '../types/asf'
import type { BotMatchResult } from '../types/steam'

export interface ResultFilterOptions {
  anyModeOnly: boolean
  selectedCardNames: string[]
}

export function filterBotResults(
  results: BotMatchResult[],
  options: ResultFilterOptions,
): BotMatchResult[] {
  let filtered = results

  if (options.anyModeOnly) {
    filtered = filtered.filter((r) => getBotTradeMode(r.bot) === 'Any')
  }

  if (options.selectedCardNames.length > 0) {
    const selected = new Set(options.selectedCardNames)
    filtered = filtered.filter((r) => {
      const botCardNames = new Set(r.cards.map((c) => c.name))
      for (const name of selected) {
        if (botCardNames.has(name)) {
          return true
        }
      }
      return false
    })
  }

  return filtered
}

export interface FilterCardOption {
  name: string
  imageUrl: string | null
}
