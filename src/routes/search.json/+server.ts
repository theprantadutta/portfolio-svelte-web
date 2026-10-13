import { json } from '@sveltejs/kit'

import { allPullRequests } from '$lib/data/open-source'
import { getAllArticles } from '$lib/devto'
import { projectKind } from '$lib/projects'
import { getAllProjects } from '$lib/server/strapi'
import type { SiteIndex } from '$lib/site-index.svelte'
import type { RequestHandler } from './$types'

// Written out as a static file at build time from the same sources as the
// pages, so the palette can never offer a page that was not built.
export const prerender = true

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

export const GET: RequestHandler = async ({ fetch }) => {
  const [projects, articles] = await Promise.all([
    getAllProjects({ fetch }),
    getAllArticles(fetch),
  ])

  const index: SiteIndex = {
    projects: projects.data.map((project) => ({
      slug: project.slug,
      title: project.title,
      kind: projectKind(project),
      year: project.startDate?.slice(0, 4) ?? '',
    })),
    posts: articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      date: shortDate(article.published_at),
      minutes: article.reading_time_minutes,
    })),
    counts: {
      projects: projects.data.length,
      posts: articles.length,
      prs: allPullRequests().length,
    },
  }

  return json(index, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
