import { describe, expect, it } from 'vitest'
import { resolveSteamApp, searchApps, unknownSteamApp } from './appList'
import type { SteamApp } from '../types/steam'

const apps: SteamApp[] = [
  { appid: 10, name: 'Counter-Strike' },
  { appid: 730, name: 'Counter-Strike 2' },
]

describe('searchApps', () => {
  it('returns known game by exact AppID', () => {
    expect(searchApps(apps, '730')).toEqual([{ appid: 730, name: 'Counter-Strike 2' }])
  })

  it('returns synthetic app for unknown AppID', () => {
    expect(searchApps(apps, '263280')).toEqual([unknownSteamApp(263280)])
  })

  it('searches by name', () => {
    expect(searchApps(apps, 'counter')).toHaveLength(2)
  })
})

describe('resolveSteamApp', () => {
  it('returns known app from list', () => {
    expect(resolveSteamApp(apps, 10)).toEqual({ appid: 10, name: 'Counter-Strike' })
  })

  it('returns synthetic app when missing from list', () => {
    expect(resolveSteamApp(apps, 263280)).toEqual(unknownSteamApp(263280))
  })
})
