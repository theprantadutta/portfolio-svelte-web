import { getAllArticles } from '$lib/devto'
import { getAllProjectSlugs } from '$lib/server/strapi'
import { SITE_URL } from '$lib/site'
import type { RequestHandler } from './$types'

// Written out as a static file at build time, from the same two sources that
// decide which pages get prerendered — so the sitemap can never list a page
// that does not exist, or miss one that does.
export const prerender = true

interface Entry {
  path: string
  lastmod?: string
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: string
}

// `&` and `<` are the only characters that can appear in a slug and break the
// document, but escaping the full set is cheap and leaves nothing to reason
// about later.
const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/** Sitemaps want W3C datetime; both sources give ISO strings already. */
const toLastmod = (value?: string | null) => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export const GET: RequestHandler = async ({ fetch }) => {
  const [projects, articles] = await Promise.all([
    getAllProjectSlugs({ fetch }),
    getAllArticles(fetch),
  ])

  const entries: Entry[] = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/projects', changefreq: 'weekly', priority: '0.9' },
    { path: '/blogs', changefreq: 'daily', priority: '0.9' },

    ...projects.map((project) => ({
      path: `/projects/${project.slug}`,
      lastmod: toLastmod(project.updatedAt),
      changefreq: 'monthly' as const,
      priority: '0.8',
    })),

    ...articles.map((article) => ({
      path: `/blogs/${article.slug}`,
      lastmod: toLastmod(article.edited_at || article.published_at),
      changefreq: 'monthly' as const,
      priority: '0.7',
    })),
  ]

  const urls = entries
    .map(({ path, lastmod, changefreq, priority }) =>
      [
        '  <url>',
        `    <loc>${escapeXml(SITE_URL + path)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
