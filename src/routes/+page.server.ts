import { commits } from '#lib/data/commits.js'
import { allPullRequests } from '#lib/data/open-source.js'
import { getAllArticles } from '#lib/devto.js'
import { shortHash } from '#lib/hash.js'
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

  return {
    projectCount: projects.data.length,
    activity: github.activity,
    commits: commits.map((commit) => ({
      ...commit,
      message: fill(commit.message),
      detail: fill(commit.detail),
      hash: shortHash(`${commit.type} ${commit.message}`),
    })),
  }
}
