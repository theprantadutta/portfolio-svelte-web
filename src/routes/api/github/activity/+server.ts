import { getLiveActivity } from '#lib/server/github.js'
import type { RequestHandler } from './$types'

// Runtime, not prerendered: this is what keeps the home page heatmap "live"
// between deploys. GitHub is asked at most once a day (see getLiveActivity);
// every other request is answered from memory.
export const prerender = false

export const GET: RequestHandler = async () => {
  const activity = getLiveActivity()
  if (!activity) {
    return Response.json(
      { error: 'GITHUB_TOKEN is not configured' },
      { status: 503 }
    )
  }

  try {
    return Response.json(await activity, {
      headers: {
        // Browsers and Cloudflare may reuse it for an hour.
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('[github] live activity failed:', error)
    return Response.json({ error: 'GitHub is unavailable' }, { status: 502 })
  }
}
