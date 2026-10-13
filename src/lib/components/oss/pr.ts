/** One merged pull request on /open-source, as the page loads it. */
export interface PullRequestView {
  number: number
  title: string
  description: string
  url: string
  resolves: { number: number; repo: string; url: string }[]
  repo: string
  /** Friendly project name, e.g. "Flutter Framework" */
  project: string
  shippedIn: string | null
  additions: number | null
  deletions: number | null
  mergedAt: string | null
}

export type DiffBlock = 'add' | 'del' | 'none'

const BLOCKS = 5

/** GitHub's diffstat: five squares split green/red by the share of each. */
export const diffBlocks = (pr: PullRequestView): DiffBlock[] => {
  const add = pr.additions ?? 0
  const del = pr.deletions ?? 0
  if (add + del === 0) return Array<DiffBlock>(BLOCKS).fill('none')
  const green = Math.round((BLOCKS * add) / (add + del))
  return Array.from({ length: BLOCKS }, (_, i) => (i < green ? 'add' : 'del'))
}

/** "Oct 3, 2026", or null when GitHub could not date the merge. */
export const mergedOn = (pr: PullRequestView) =>
  pr.mergedAt
    ? new Date(pr.mergedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null
