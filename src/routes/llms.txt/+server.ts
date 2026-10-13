import {
  allPullRequests,
  openSourceContributions,
} from '#lib/data/open-source.js'
import { profile } from '#lib/data/profile.js'
import { getMostLikedArticles } from '#lib/devto.js'
import { getAllProjects } from '#lib/server/strapi.js'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '#lib/site.js'
import type { RequestHandler } from './$types'

/**
 * llms.txt — a markdown summary of the site for language models, following the
 * llmstxt.org convention: an H1, a blockquote summary, then linked sections.
 *
 * Worth being clear about what this is: a young convention, not a standard. No
 * search engine requires it and nothing breaks without it. It is here because
 * the file was being probed in the logs, it costs one prerendered file, and it
 * gives an assistant reading the site a clean index instead of making it parse
 * every page. Counts are computed from the same data the pages render.
 */
export const prerender = true

/** Keep entries to one line each — the format is a link list, not prose. */
const oneLine = (value: string, max = 160) => {
  const flat = value.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat
}

export const GET: RequestHandler = async ({ fetch }) => {
  const [projects, articles] = await Promise.all([
    getAllProjects({ fetch }),
    getMostLikedArticles(10, fetch),
  ])

  const projectLines = projects.data.map(
    (project) =>
      `- [${project.title}](${SITE_URL}/projects/${project.slug}): ${oneLine(
        project.description || 'Project'
      )}`
  )

  const articleLines = articles.map(
    (article) =>
      `- [${article.title}](${SITE_URL}/blogs/${article.slug}): ${oneLine(
        article.description || 'Article'
      )}`
  )

  const prs = allPullRequests().length
  const repos = openSourceContributions.length
  const onPlay = projects.data.filter((p) => p.googlePlayLink).length
  const onAppStore = projects.data.filter((p) => p.appStoreLink).length

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${profile.role} based in ${profile.location}, with ${prs} merged pull requests
across ${repos} open-source projects: the Flutter SDK, Flutter DevTools, Flutter
packages, the React Native docs, Supabase and Sentry. Primary developer of 16+
in-house production systems at KDS Group, used across a 20,000+ person
workforce, plus ${onPlay} public apps on Google Play (${onAppStore} also on the
App Store). Works in Flutter, React Native, .NET and Go, plus AI platforms and
LLM integrations. Contactable at ${profile.email}.

## Pages

- [Home](${SITE_URL}/): Career as a git log, plus a live GitHub activity heatmap.
- [About](${SITE_URL}/about): Background, the systems that moved numbers, and current work.
- [Projects](${SITE_URL}/projects): Every shipped project, filterable by Mobile, Backend and AI.
- [Open source](${SITE_URL}/open-source): Every merged pull request, with diff sizes.
- [Blog](${SITE_URL}/blogs): Technical writing, syndicated from dev.to.
- [Skills](${SITE_URL}/skills): Stack by area, and work experience as a branch timeline.
- [Contact](${SITE_URL}/contact): Contact form, social profiles and availability.
- [CV](${SITE_URL}/download-cv): Current resume as a PDF. Permanent link, always the latest version.
- [Services](https://pdlabs.pranta.dev): PD Labs, available for hire. Separate site.

## Projects

${projectLines.join('\n')}

## Selected writing

${articleLines.join('\n')}

## Elsewhere

- [GitHub](https://github.com/theprantadutta/)
- [LinkedIn](https://www.linkedin.com/in/theprantadutta/)
- [dev.to](https://dev.to/pranta)
- [X](https://x.com/theprantadutta)
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
