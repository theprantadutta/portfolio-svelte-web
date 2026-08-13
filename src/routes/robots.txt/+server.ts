import { SITE_URL } from '$lib/site'
import type { RequestHandler } from './$types'

// A route rather than a file in static/ so the Sitemap line is built from the
// same SITE_URL constant the sitemap itself uses, and the two cannot drift.
export const prerender = true

/**
 * Note on Cloudflare: with no robots.txt at the origin, Cloudflare was serving
 * its own Content Signals boilerplate — 24 lines of comments and not a single
 * directive, so crawlers got no sitemap pointer at all. Cloudflare appends its
 * signals to a real robots.txt rather than replacing it, so this takes over the
 * actual rules.
 */
const body = `# https://www.robotstxt.org/robotstxt.html

User-agent: *
Allow: /

# The contact endpoint is a POST-only API with nothing to index.
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`

export const GET: RequestHandler = async () =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
