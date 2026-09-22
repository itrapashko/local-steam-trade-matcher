import { isSteamApiPath } from '../utils/steamProxy'

const PRODUCTION_PROXY_BASE_URL = (import.meta.env.VITE_PROXY_BASE_URL ?? '').replace(/\/$/, '')
const DEFAULT_FETCH_RETRY_DELAYS = [1000, 3000, 10000]
const STEAM_FETCH_RETRY_DELAYS = [3000, 7000, 30000, 65000]

function getProxyBaseUrl(): string {
  return import.meta.env.DEV ? '' : PRODUCTION_PROXY_BASE_URL
}

export interface ApiClient {
  fetchText(path: string, init?: RequestInit): Promise<string>
  fetchJson<T>(path: string, init?: RequestInit): Promise<T>
}

export function createApiClient(proxyBaseUrl?: string): ApiClient {
  const base = (proxyBaseUrl ?? getProxyBaseUrl()).replace(/\/$/, '')

  function resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    const normalized = path.startsWith('/') ? path : `/${path}`
    return base ? `${base}${normalized}` : normalized
  }

  async function fetchWithRetry(
    url: string,
    init: RequestInit | undefined,
    retryDelays: number[],
  ): Promise<Response> {
    let lastError: unknown
    const maxAttempts = retryDelays.length + 1
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(url, init)
        const canRetry = attempt < retryDelays.length
        const shouldRetry =
          canRetry && (response.status === 429 || response.status === 403 || response.status === 0)
        if (shouldRetry) {
          await delay(retryDelays[attempt])
          continue
        }
        return response
      } catch (error) {
        lastError = error
        if (attempt >= retryDelays.length) {
          break
        }
        await delay(retryDelays[attempt])
      }
    }
    throw lastError
  }

  async function fetchResolved(path: string, init?: RequestInit): Promise<Response> {
    const url = resolveUrl(path)
    const isSteamApi = isSteamApiPath(url)
    const retryDelays = isSteamApi ? STEAM_FETCH_RETRY_DELAYS : DEFAULT_FETCH_RETRY_DELAYS
    return fetchWithRetry(
      url,
      { ...init, redirect: 'follow' },
      retryDelays,
    )
  }

  return {
    async fetchText(path: string, init?: RequestInit): Promise<string> {
      const response = await fetchResolved(path, init)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path}`)
      }
      return response.text()
    },
    async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
      const response = await fetchResolved(path, init)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path}`)
      }
      return response.json() as Promise<T>
    },
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
