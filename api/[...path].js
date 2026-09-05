// Vercel serverless proxy
// Frontend -> /api/v1/* (this function) -> https://careersync-ai-backend.onrender.com/api/v1/*
const BACKEND_BASE = 'https://careersync-ai-backend.onrender.com'
const API_PREFIX = '/api/v1'

// Headers that must not be forwarded between hops
const HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailers',
  'proxy-authenticate',
  'proxy-authorization',
  'upgrade',
])

export const config = { maxDuration: 300 }

export default async function handler(req, res) {
  try {
    const segments = Array.isArray(req.query.path) ? req.query.path : []
    const qs = req.url && req.url.includes('?')
      ? '?' + req.url.split('?').slice(1).join('?')
      : ''

    const body = await readBody(req)

    const headers = {}
    for (const [key, value] of Object.entries(req.headers)) {
      const lower = key.toLowerCase()
      if (HOP_HEADERS.has(lower)) continue
      if (lower === 'host' || lower === 'content-length') continue
      headers[key] = value
    }

    const url = `${BACKEND_BASE}${API_PREFIX}/${segments.join('/')}${qs}`
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    })

    const buf = Buffer.from(await upstream.arrayBuffer())

    res.statusCode = upstream.status
    upstream.headers.forEach((value, key) => {
      if (HOP_HEADERS.has(key.toLowerCase())) return
      res.setHeader(key, value)
    })
    res.setHeader('content-length', String(buf.length))
    res.end(buf)
  } catch (err) {
    console.error('Proxy error:', err)
    res.statusCode = 502
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Proxy upstream error', detail: err.message }))
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (!req || typeof req.on !== 'function') return resolve(null)
    const chunks = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(chunks.length > 0 ? Buffer.concat(chunks) : null))
    req.on('error', reject)
  })
}