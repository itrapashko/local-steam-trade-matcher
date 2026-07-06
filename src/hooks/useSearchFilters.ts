import { useEffect, useState } from 'react'
import type { CardType } from '../types/steam'

export function useSearchFilters(gameAppId: number | null) {
  const [cardType, setCardType] = useState<CardType>('regular')
  const [anyModeOnly, setAnyModeOnly] = useState(false)
  const [selectedCardNames, setSelectedCardNames] = useState<string[]>([])

  useEffect(() => {
    setCardType('regular')
    setAnyModeOnly(false)
    setSelectedCardNames([])
  }, [gameAppId])

  return {
    cardType,
    setCardType,
    anyModeOnly,
    setAnyModeOnly,
    selectedCardNames,
    setSelectedCardNames,
  }
}
