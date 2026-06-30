const ASF_ORIGIN = 'https://asf.justarchi.net'
const STEAM_ORIGIN = 'https://steamcommunity.com'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function corsResponse(body: BodyInit | null, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  })
}

function resolveUpstream(pathname: string, search: string): string | null {
  if (pathname.startsWith('/api/asf/')) {
    return `${ASF_ORIGIN}${pathname.slice('/api/asf'.length)}${search}`
  }
  if (pathname.startsWith('/api/steam/')) {
    return `${STEAM_ORIGIN}${pathname.slice('/api/steam'.length)}${search}`
  }
  return null
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204)
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return corsResponse('Method not allowed', 405)
    }

    const url = new URL(request.url)
    const targetUrl = resolveUpstream(url.pathname, url.search)
    if (!targetUrl) {
      return corsResponse('Not found', 404)
    }

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': request.headers.get('User-Agent') ?? 'Mozilla/5.0 (compatible; STM-Proxy/1.0)',
        Accept: request.headers.get('Accept') ?? '*/*',
      },
      redirect: 'follow',
    })

    const contentType = upstream.headers.get('Content-Type')
    const headers: Record<string, string> = { ...CORS_HEADERS }
    if (contentType) {
      headers['Content-Type'] = contentType
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    })
  },
}
