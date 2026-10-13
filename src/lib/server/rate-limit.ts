import type { RequestEvent } from '@sveltejs/kit'

/**
 * A fixed-window limiter kept in memory, per client address.
 *
 * The site runs as a single Node container, so memory is the whole fleet;
 * there is nothing to coordinate with. It exists to stop a script hammering
 * the two write endpoints (contact form, reactions), not to meter honest use,
 * so the windows are generous.
 */
export const createRateLimiter = ({
  limit,
  windowMs,
}: {
  limit: number
  windowMs: number
}) => {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return (key: string) => {
    const now = Date.now()

    // Keep the map from growing without bound on a long-lived process.
    if (hits.size > 5000) {
      for (const [k, entry] of hits) if (entry.resetAt <= now) hits.delete(k)
    }

    const entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return { ok: true, retryAfter: 0 }
    }

    entry.count++
    return entry.count <= limit
      ? { ok: true, retryAfter: 0 }
      : { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
}

/**
 * The visitor's address. Behind Cloudflare and Traefik the socket address is
 * the proxy's, so the forwarded headers come first: Cloudflare's own, then
 * the first hop of X-Forwarded-For.
 */
export const clientAddress = (event: RequestEvent) => {
  const cloudflare = event.request.headers.get('cf-connecting-ip')
  if (cloudflare) return cloudflare

  const forwarded = event.request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  try {
    return event.getClientAddress()
  } catch {
    return 'unknown'
  }
}
