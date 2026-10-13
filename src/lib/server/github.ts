import { env } from '$env/dynamic/private'
import { pullRequestUrls } from '$lib/data/open-source'
import fallback from '$lib/data/github.snapshot.json'
import {
  fetchActivity,
  fetchSnapshot,
  type Activity,
  type GitHubSnapshot,
} from '$lib/github'

const committed = fallback as GitHubSnapshot

let buildSnapshot: Promise<GitHubSnapshot> | undefined

/**
 * Live GitHub data for the build: the contribution heatmap, the diff size of
 * every merged PR on /open-source and the languages bar.
 *
 * Fetched once per build. Without GITHUB_TOKEN, or if GitHub fails, the site
 * renders the committed snapshot (refresh it with
 * scripts/refresh-github-snapshot.ts) rather than failing the deploy: these
 * are decorations around real content, not content a stale value would make
 * wrong.
 */
export const getGitHubSnapshot = () =>
  (buildSnapshot ??= (async () => {
    const token = env.GITHUB_TOKEN
    if (!token) {
      console.warn(
        '[github] GITHUB_TOKEN is not set, so the committed snapshot is used.'
      )
      return committed
    }

    try {
      const live = await fetchSnapshot(token, pullRequestUrls())
      return {
        ...live,
        // A PR GitHub could not resolve keeps its last known numbers.
        pullRequests: { ...committed.pullRequests, ...live.pullRequests },
      }
    } catch (error) {
      console.warn('[github] Falling back to the committed snapshot:', error)
      return committed
    }
  })())

const DAY = 24 * 60 * 60 * 1000

let liveActivity: { at: number; value: Promise<Activity> } | undefined

/**
 * The heatmap for the runtime /api/github/activity endpoint, refetched at
 * most once a day: the prerendered page already carries the build's copy, so
 * this only has to keep "live" honest between deploys.
 *
 * Returns null when there is no token at runtime, which the endpoint reports
 * as unavailable and the page answers by keeping what it has.
 */
export const getLiveActivity = (): Promise<Activity> | null => {
  const token = env.GITHUB_TOKEN
  if (!token) return null

  if (!liveActivity || Date.now() - liveActivity.at > DAY) {
    const value = fetchActivity(token)
    liveActivity = { at: Date.now(), value }
    value.catch(() => {
      if (liveActivity?.value === value) liveActivity = undefined
    })
  }
  return liveActivity.value
}
