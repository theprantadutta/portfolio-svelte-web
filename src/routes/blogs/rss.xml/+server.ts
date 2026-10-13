import { getAllArticles } from '#lib/devto.js'
import { SITE_URL } from '#lib/site.js'
import type { RequestHandler } from './$types'

// Written out as a static file at build time from the same article list as
// /blogs, so the feed and the blog always agree. Linked from every page's
// <head> (app.html), which is also how the prerender crawler finds it.
export const prerender = true

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const GET: RequestHandler = async ({ fetch }) => {
  const articles = await getAllArticles(fetch)
  const latest = articles[0]?.edited_at ?? articles[0]?.published_at

  const items = articles
    .map((article) => {
      const link = `${SITE_URL}/blogs/${article.slug}`
      const categories = (article.tag_list ?? [])
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n')
      return [
        '    <item>',
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(article.description ?? '')}</description>`,
        categories,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pranta Dutta · Notes from shipping</title>
    <link>${SITE_URL}/blogs</link>
    <description>Flutter, mobile development, game monetisation and AI-assisted engineering, by Pranta Dutta.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blogs/rss.xml" rel="self" type="application/rss+xml" />
${latest ? `    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
