import { useEffect, useState } from 'react'

export function useSearchFilters(gameAppId: number | null) {
  const [anyModeOnly, setAnyModeOnly] = useState(false)
  const [selectedCardNames, setSelectedCardNames] = useState<string[]>([])

  useEffect(() => {
    setAnyModeOnly(false)
    setSelectedCardNames([])
  }, [gameAppId])

  return {
    anyModeOnly,
    setAnyModeOnly,
    selectedCardNames,
    setSelectedCardNames,
  }
}
