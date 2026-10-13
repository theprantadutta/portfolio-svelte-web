import { STRAPI_REACTIONS_TOKEN } from '$app/env/private'
import { getAllArticles } from '#lib/devto.js'
import { isReactionEmoji, REACTION_SLUG } from '#lib/reactions.js'
import { clientAddress, createRateLimiter } from '#lib/server/rate-limit.js'
import { getReactionCounts, react } from '#lib/server/strapi.js'
import type { RequestHandler } from './$types'

// Runtime: reactions change after the build. Counts live in the CMS's
// post-reaction collection, reached with STRAPI_REACTIONS_TOKEN, a token
// scoped to reading that collection and its `react` action. It never leaves
// the server.
export const prerender = false

const noStore = { 'Cache-Control': 'no-store' }
const limit = createRateLimiter({ limit: 30, windowMs: 60_000 })

const tokenOrError = () => {
  const token = STRAPI_REACTIONS_TOKEN
  return token
    ? { token }
    : {
        error: Response.json(
          {
            error:
              'Reactions are not configured (STRAPI_REACTIONS_TOKEN is unset).',
          },
          { status: 503, headers: noStore }
        ),
      }
}

/**
 * True when dev.to has a post with this slug. Stops the endpoint from
 * minting rows for made-up slugs. If dev.to itself can't be reached, the
 * reaction is let through rather than blocked: the slug pattern still holds.
 */
const isKnownPost = async (slug: string) => {
  try {
    const articles = await getAllArticles()
    return articles.some((article) => article.slug === slug)
  } catch {
    return true
  }
}

export const GET: RequestHandler = async ({ params }) => {
  if (!REACTION_SLUG.test(params.slug)) {
    return Response.json(
      { error: 'Unknown post' },
      { status: 404, headers: noStore }
    )
  }

  const auth = tokenOrError()

  if (auth.error) return auth.error

  try {
    const counts = await getReactionCounts(params.slug, auth.token)
    return Response.json({ counts }, { headers: noStore })
  } catch (error) {
    console.error('[reactions] reading counts failed:', error)
    return Response.json(
      { error: 'Reactions are unavailable' },
      { status: 502, headers: noStore }
    )
  }
}

export const POST: RequestHandler = async (event) => {
  const { params, request } = event
  if (!REACTION_SLUG.test(params.slug)) {
    return Response.json(
      { error: 'Unknown post' },
      { status: 404, headers: noStore }
    )
  }

  const body = (await request.json().catch(() => null)) as {
    emoji?: unknown
    delta?: unknown
  } | null

  if (
    !body ||
    !isReactionEmoji(body.emoji) ||
    (body.delta !== 1 && body.delta !== -1)
  ) {
    return Response.json(
      {
        error:
          'Expected { emoji: heart | fire | rocket | eyes, delta: 1 | -1 }',
      },
      { status: 400, headers: noStore }
    )
  }

  const verdict = limit(clientAddress(event))
  if (!verdict.ok) {
    return Response.json(
      { error: 'Too many reactions. Try again shortly.' },
      {
        status: 429,
        headers: { ...noStore, 'Retry-After': String(verdict.retryAfter) },
      }
    )
  }

  const auth = tokenOrError()

  if (auth.error) return auth.error

  if (!(await isKnownPost(params.slug))) {
    return Response.json(
      { error: 'Unknown post' },
      { status: 404, headers: noStore }
    )
  }

  try {
    const counts = await react(params.slug, body.emoji, body.delta, auth.token)
    return Response.json({ counts }, { headers: noStore })
  } catch (error) {
    console.error('[reactions] saving a reaction failed:', error)
    return Response.json(
      { error: 'Reactions are unavailable' },
      { status: 502, headers: noStore }
    )
  }
}
