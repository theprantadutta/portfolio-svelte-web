import { allPullRequests } from '$lib/data/open-source'
import { getGitHubSnapshot } from '$lib/server/github'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const { pullRequests: stats } = await getGitHubSnapshot()

  const pullRequests = allPullRequests()
    .map((pr) => {
      const diff = stats[pr.url]
      return {
        number: pr.number,
        title: pr.title,
        description: pr.description,
        url: pr.url,
        resolves: pr.resolves ?? [],
        repo: pr.contribution.repo,
        project: pr.contribution.name,
        shippedIn: pr.contribution.shippedIn ?? null,
        additions: diff?.additions ?? null,
        deletions: diff?.deletions ?? null,
        mergedAt: diff?.mergedAt ?? null,
      }
    })
    // Newest merge first; anything GitHub could not date goes last.
    .sort((a, b) => (b.mergedAt ?? '').localeCompare(a.mergedAt ?? ''))

  const sum = (pick: (pr: (typeof pullRequests)[number]) => number | null) =>
    pullRequests.reduce((total, pr) => total + (pick(pr) ?? 0), 0)

  return {
    pullRequests,
    totals: {
      additions: sum((pr) => pr.additions),
      deletions: sum((pr) => pr.deletions),
      repos: new Set(pullRequests.map((pr) => pr.repo)).size,
    },
  }
}
