import type { SteamApp } from '../types/steam'

const APP_LIST_URL =
  'https://raw.githubusercontent.com/jsnli/steamappidlist/master/data/games_appid.json'
const LEGACY_CACHE_KEY = 'stm-app-list'
const IDB_NAME = 'local-steam-trade-matcher'
const IDB_STORE = 'cache'
const IDB_APP_LIST_KEY = 'app-list'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface CachedAppList {
  fetchedAt: number
  apps: SteamApp[]
}

type RawAppList = Array<{ appid: number; name: string }>

let memoryCache: CachedAppList | null = null

clearLegacyLocalStorageCache()

export async function loadAppList(): Promise<SteamApp[]> {
  if (memoryCache && !isExpired(memoryCache)) {
    return memoryCache.apps
  }

  const cached = await readIndexedDbCache()
  if (cached) {
    memoryCache = cached
    return cached.apps
  }

  const response = await fetch(APP_LIST_URL)
  if (!response.ok) {
    throw new Error(`Failed to load game list: HTTP ${response.status}`)
  }

  const data = (await response.json()) as RawAppList
  const apps = data.map((app) => ({
    appid: app.appid,
    name: app.name,
  }))

  memoryCache = {
    fetchedAt: Date.now(),
    apps,
  }

  await writeIndexedDbCache(memoryCache).catch(() => {
    // IndexedDB may be unavailable; in-memory cache still works for this session.
  })

  return apps
}

export function unknownSteamApp(appId: number): SteamApp {
  return { appid: appId, name: 'Game not in Steam list' }
}

export function resolveSteamApp(apps: SteamApp[], appId: number): SteamApp {
  return apps.find((app) => app.appid === appId) ?? unknownSteamApp(appId)
}

export function searchApps(apps: SteamApp[], query: string, limit = 20): SteamApp[] {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  if (/^\d+$/.test(trimmed)) {
    const appId = Number(trimmed)
    const exact = apps.find((app) => app.appid === appId)
    return [exact ?? unknownSteamApp(appId)]
  }

  const lower = trimmed.toLowerCase()
  const matches: SteamApp[] = []
  for (const app of apps) {
    if (app.name.toLowerCase().includes(lower)) {
      matches.push(app)
      if (matches.length >= limit) {
        break
      }
    }
  }
  return matches
}

export function findAppById(apps: SteamApp[], appId: number): SteamApp | undefined {
  return apps.find((app) => app.appid === appId)
}

function isExpired(cache: CachedAppList): boolean {
  return Date.now() - cache.fetchedAt > CACHE_TTL_MS
}

function clearLegacyLocalStorageCache(): void {
  try {
    localStorage.removeItem(LEGACY_CACHE_KEY)
  } catch {
    // Quota or privacy mode — ignore.
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1)
    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB'))
    }
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
  })
}

async function readIndexedDbCache(): Promise<CachedAppList | null> {
  try {
    const db = await openDatabase()
    return await new Promise<CachedAppList | null>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE, 'readonly')
      const request = transaction.objectStore(IDB_STORE).get(IDB_APP_LIST_KEY)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const value = request.result as CachedAppList | undefined
        if (!value || isExpired(value)) {
          resolve(null)
          return
        }
        resolve(value)
      }
    })
  } catch {
    return null
  }
}

async function writeIndexedDbCache(cache: CachedAppList): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(IDB_STORE, 'readwrite')
    const request = transaction.objectStore(IDB_STORE).put(cache, IDB_APP_LIST_KEY)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
