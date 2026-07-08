export const DEFAULT_RATE_LIMIT_MS = 300

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
