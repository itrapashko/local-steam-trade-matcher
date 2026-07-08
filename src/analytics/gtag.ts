const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()

declare global {
  interface Window {
    dataLayer: IArguments[]
    gtag: (...args: unknown[]) => void
  }
}

function logAnalytics(message: string, ...details: unknown[]): void {
  if (import.meta.env.DEV) {
    console.info(`[analytics] ${message}`, ...details)
  }
}

function warnAnalytics(message: string, ...details: unknown[]): void {
  if (import.meta.env.DEV) {
    console.warn(`[analytics] ${message}`, ...details)
  }
}

export function initGoogleAnalytics(): void {
  if (!MEASUREMENT_ID) {
    logAnalytics('disabled: set VITE_GA_MEASUREMENT_ID in .env and restart dev server')
    return
  }

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag(
    'config',
    MEASUREMENT_ID,
    import.meta.env.DEV ? { debug_mode: true } : {},
  )

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  script.onload = () => {
    logAnalytics('gtag.js loaded — look for requests to google-analytics.com/g/collect in Network (All)')
  }
  script.onerror = () => {
    warnAnalytics(
      'failed to load gtag.js — events stay in dataLayer only; disable ad blocker for localhost',
    )
  }
  document.head.appendChild(script)

  logAnalytics(`enabled (${MEASUREMENT_ID})`)
}

export function trackGoogleAnalyticsEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (!MEASUREMENT_ID) {
    return
  }

  window.gtag?.('event', eventName, params)
}
