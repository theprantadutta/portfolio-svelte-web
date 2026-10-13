import { commits } from '#lib/data/commits.js'
import { allPullRequests } from '#lib/data/open-source.js'
import { home } from '#lib/data/profile.js'
import { getAllArticles } from '#lib/devto.js'
import { shortHash } from '#lib/hash.js'
import { projectScreenshots } from '#lib/projects.js'
import { getGitHubSnapshot } from '#lib/server/github.js'
import { getAllProjects } from '#lib/server/strapi.js'
import type { PageServerLoad } from './$types'

// Runs once at build time (the whole route tree is prerendered), so these
// upstream requests happen during `vite build` and never on a page view.
export const load: PageServerLoad = async ({ fetch }) => {
  const [projects, articles, github] = await Promise.all([
    getAllProjects({ fetch }),
    getAllArticles(fetch),
    getGitHubSnapshot(),
  ])

  const fill = (text: string) =>
    text
      .replace('{posts}', String(articles.length))
      .replace('{prs}', String(allPullRequests().length))

  // The hero's fanned phones: each listed project's first screenshot.
  const heroPhones = home.heroPhones.flatMap((slug) => {
    const project = projects.data.find((p) => p.slug === slug)
    const shot = project && projectScreenshots(project)[0]
    return project && shot ? [{ slug, title: project.title, shot }] : []
  })

  return {
    projectCount: projects.data.length,
    heroPhones,
    activity: github.activity,
    commits: commits.map((commit) => ({
      ...commit,
      message: fill(commit.message),
      detail: fill(commit.detail),
      hash: shortHash(`${commit.type} ${commit.message}`),
    })),
  }
}
