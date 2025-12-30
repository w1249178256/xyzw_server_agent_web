// Cloudflare Pages Function - API Proxy
const BACKEND = 'https://service.yx-game.cn'

export const onRequest: PagesFunction = async ({ request }) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api/, '')
  const target = BACKEND + path + url.search

  try {
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
    }

    const auth = request.headers.get('Authorization')
    if (auth) headers['Authorization'] = auth

    const res = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : await request.text(),
    })

    return new Response(await res.text(), {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }
}
