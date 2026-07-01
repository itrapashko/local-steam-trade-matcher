import type { ApiClient } from './client'
import type { AsfBot } from '../types/asf'

const ASF_BOTS_LIST_URL = 'https://asf.justarchi.net/Api/Listing/Bots'

type AsfBotApiRow = AsfBot & { SteamID: number }

interface AsfBotsApiResponse {
  Result: AsfBotApiRow[]
}

export async function fetchBots(client: ApiClient): Promise<AsfBot[]> {
  const data = await client.fetchJson<AsfBotsApiResponse>(ASF_BOTS_LIST_URL)
  return (data.Result ?? []).map(({ SteamID: _steamId, ...bot }) => bot)
}
