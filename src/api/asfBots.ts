import type { ApiClient } from './client'
import type { AsfBot } from '../types/asf'

type AsfBotApiRow = AsfBot & { SteamID: number }

interface AsfBotsApiResponse {
  Result: AsfBotApiRow[]
}

export async function fetchBots(client: ApiClient): Promise<AsfBot[]> {
  const data = await client.fetchJson<AsfBotsApiResponse>('/api/asf/Api/Listing/Bots')
  return (data.Result ?? []).map(({ SteamID: _steamId, ...bot }) => bot)
}
