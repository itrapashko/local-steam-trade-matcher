export const DEFAULT_RATE_LIMIT_MS = 1100

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
