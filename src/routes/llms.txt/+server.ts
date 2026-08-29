import { getMostLikedArticles } from '$lib/devto'
import { getAllProjects } from '$lib/server/strapi'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '$lib/site'
import type { RequestHandler } from './$types'

/**
 * llms.txt — a markdown summary of the site for language models, following the
 * llmstxt.org convention: an H1, a blockquote summary, then linked sections.
 *
 * Worth being clear about what this is: a young convention, not a standard. No
 * search engine requires it and nothing breaks without it. It is here because
 * the file was being probed in the logs, it costs one prerendered file, and it
 * gives an assistant reading the site a clean index instead of making it parse
 * a glassmorphic single-page document.
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

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Flutter & Mobile Engineer based in Bangladesh. Builds mobile apps, backend APIs
and the infrastructure connecting them, in Flutter, React Native, Go and .NET,
plus AI/LLM integrations. Contactable at prantadutta1997@gmail.com.

## Pages

- [Home](${SITE_URL}/): Introduction, background, skills, experience and contact form.
- [Projects](${SITE_URL}/projects): Every shipped project, filterable by technology.
- [Blog](${SITE_URL}/blogs): Technical writing, syndicated from dev.to.
- [CV](${SITE_URL}/download-cv): Current resume as a PDF. Permanent link — always the latest version.
- [Services](https://pdlabs.pranta.dev): PD Labs — available for hire. Separate site.

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
