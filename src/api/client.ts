import { isSteamApiPath } from '../utils/steamProxy'

const PRODUCTION_PROXY_BASE_URL = (import.meta.env.VITE_PROXY_BASE_URL ?? '').replace(/\/$/, '')
const STEAM_FETCH_RETRIES = 3

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
    init?: RequestInit,
    retries = 2,
  ): Promise<Response> {
    let lastError: unknown
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, init)
        const shouldRetry =
          attempt < retries && (response.status === 429 || response.status === 0)
        if (shouldRetry) {
          await delay(1000 * (attempt + 1))
          continue
        }
        return response
      } catch (error) {
        lastError = error
        if (attempt < retries) {
          await delay(1000 * (attempt + 1))
        }
      }
    }
    throw lastError
  }

  async function fetchResolved(path: string, init?: RequestInit): Promise<Response> {
    const url = resolveUrl(path)
    const retries = isSteamApiPath(path) ? STEAM_FETCH_RETRIES : 2
    return fetchWithRetry(
      url,
      { ...init, redirect: 'follow' },
      retries,
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
