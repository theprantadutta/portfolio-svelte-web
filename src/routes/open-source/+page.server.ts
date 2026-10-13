import {
  allPullRequests,
  openSourceContributions,
} from '#lib/data/open-source.js'
import { getGitHubSnapshot } from '#lib/server/github.js'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const { pullRequests: stats, repositories: repoStats } =
    await getGitHubSnapshot()

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

  // Every repository with merged work, most contributions first, then the
  // most-starred. Stars and avatars come from GitHub at build time.
  const repositories = openSourceContributions
    .map((contribution) => {
      const github = repoStats[contribution.repo]
      return {
        repo: contribution.repo,
        name: contribution.name,
        url: contribution.repoUrl,
        merged: contribution.pullRequests.length,
        stars: github?.stars ?? null,
        language: github?.language ?? null,
        avatarUrl: github?.avatarUrl ?? null,
      }
    })
    .sort((a, b) => b.merged - a.merged || (b.stars ?? 0) - (a.stars ?? 0))

  const sum = (pick: (pr: (typeof pullRequests)[number]) => number | null) =>
    pullRequests.reduce((total, pr) => total + (pick(pr) ?? 0), 0)

  return {
    pullRequests,
    repositories,
    totals: {
      additions: sum((pr) => pr.additions),
      deletions: sum((pr) => pr.deletions),
      repos: repositories.length,
    },
  }
}
