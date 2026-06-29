import { describe, expect, it } from 'vitest'
import { toProxiedSteamUrl } from './steamProxy'

describe('toProxiedSteamUrl', () => {
  it('rewrites absolute steamcommunity URL to local proxy path', () => {
    expect(
      toProxiedSteamUrl(
        'https://steamcommunity.com/id/foo/gamecards/562260?l=english',
        '',
      ),
    ).toBe('/api/steam/id/foo/gamecards/562260?l=english')
  })

  it('rewrites relative path', () => {
    expect(toProxiedSteamUrl('/id/foo/gamecards/562260', '')).toBe(
      '/api/steam/id/foo/gamecards/562260',
    )
  })

  it('prepends external proxy base', () => {
    expect(
      toProxiedSteamUrl('https://steamcommunity.com/profiles/1/gamecards/2/', 'https://worker.test'),
    ).toBe('https://worker.test/api/steam/profiles/1/gamecards/2/')
  })
})
