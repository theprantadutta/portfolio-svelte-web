/**
 * GitHub data behind the heatmap, the open-source diff counts and the
 * languages bar.
 *
 * Pure functions over the GraphQL API that take the token as an argument, so
 * the same code runs in three places: the build (via `$lib/server/github`),
 * the runtime `/api/github/activity` endpoint, and
 * `scripts/refresh-github-snapshot.ts`, which rewrites the committed fallback
 * in `src/lib/data/github.snapshot.json`.
 *
 * Nothing here is secret except the token, and the token never leaves the
 * server: the browser only ever sees the shapes below.
 */

export const GITHUB_LOGIN = 'theprantadutta'
export const ACTIVITY_WEEKS = 26

const ENDPOINT = 'https://api.github.com/graphql'

export type HeatLevel = 0 | 1 | 2 | 3 | 4

export interface ContributionDay {
  /** ISO date, e.g. "2026-08-04" */
  date: string
  count: number
  /** GitHub's own quartile for the day, 0 = none, 4 = busiest */
  level: HeatLevel
}

export interface Activity {
  /** Contributions in the window, matching the cells on screen */
  total: number
  /** Sunday-first weeks, oldest first. The last one may be partial. */
  weeks: ContributionDay[][]
  fetchedAt: string
}

export interface PullRequestStats {
  additions: number
  deletions: number
  mergedAt: string | null
}

export interface LanguageShare {
  name: string
  /** Public, non-fork repositories with this primary language */
  repos: number
}

/**
 * Only repositories pushed to within this many months count toward the
 * languages bar, so it shows what is being written now rather than every
 * tutorial repo since university.
 */
export const LANGUAGE_WINDOW_MONTHS = 24

export interface GitHubSnapshot {
  activity: Activity
  /** Keyed by the pull request's html URL */
  pullRequests: Record<string, PullRequestStats>
  languages: LanguageShare[]
}

type Fetcher = typeof globalThis.fetch

const graphql = async <T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
  fetchFn: Fetcher
): Promise<T> => {
  const response = await fetchFn(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'pranta.dev',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL request failed – ${response.status} ${response.statusText}`
    )
  }

  const body = (await response.json()) as {
    data?: T
    errors?: { message: string }[]
  }

  if (body.errors?.length || !body.data) {
    throw new Error(
      `GitHub GraphQL error – ${body.errors?.map((e) => e.message).join('; ') ?? 'no data'}`
    )
  }

  return body.data
}

const LEVELS: Record<string, HeatLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

/**
 * The Sunday that starts the oldest week on screen, at 00:00 UTC.
 *
 * GitHub's calendar weeks run Sunday to Saturday, so starting the range on a
 * Sunday makes every column a whole week except the current one.
 */
export const activityWindowStart = (now: Date) => {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())
  start.setUTCDate(start.getUTCDate() - (ACTIVITY_WEEKS - 1) * 7)
  return start
}

export const fetchActivity = async (
  token: string,
  fetchFn: Fetcher = globalThis.fetch,
  now = new Date()
): Promise<Activity> => {
  const data = await graphql<{
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: {
              date: string
              contributionCount: number
              contributionLevel: string
            }[]
          }[]
        }
      }
    }
  }>(
    token,
    `
      query Activity($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `,
    {
      login: GITHUB_LOGIN,
      from: activityWindowStart(now).toISOString(),
      to: now.toISOString(),
    },
    fetchFn
  )

  const weeks = data.user.contributionsCollection.contributionCalendar.weeks
    .map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      }))
    )
    .filter((week) => week.length > 0)
    .slice(-ACTIVITY_WEEKS)

  return {
    total: weeks.flat().reduce((sum, day) => sum + day.count, 0),
    weeks,
    fetchedAt: now.toISOString(),
  }
}

const PR_URL = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/

/** Diff size and merge date for each listed pull request, in one request. */
export const fetchPullRequestStats = async (
  token: string,
  urls: string[],
  fetchFn: Fetcher = globalThis.fetch
): Promise<Record<string, PullRequestStats>> => {
  const parsed = urls.map((url) => {
    const match = PR_URL.exec(url)
    if (!match) throw new Error(`Not a pull request URL: ${url}`)
    return { url, owner: match[1], repo: match[2], number: Number(match[3]) }
  })

  if (parsed.length === 0) return {}

  // Aliases keep this to a single round trip however many PRs are listed.
  const query = `query {${parsed
    .map(
      (pr, i) =>
        `p${i}: repository(owner: ${JSON.stringify(pr.owner)}, name: ${JSON.stringify(pr.repo)}) {
          pullRequest(number: ${pr.number}) { additions deletions mergedAt }
        }`
    )
    .join('\n')}}`

  const data = await graphql<
    Record<string, { pullRequest: PullRequestStats | null } | null>
  >(token, query, {}, fetchFn)

  const stats: Record<string, PullRequestStats> = {}
  parsed.forEach((pr, i) => {
    const found = data[`p${i}`]?.pullRequest
    if (found) stats[pr.url] = found
  })
  return stats
}

/**
 * Public, non-fork repositories counted by primary language, largest first.
 *
 * Counted per repository rather than by bytes on purpose. Byte totals are
 * dominated by code nobody wrote by hand: every Flutter app carries generated
 * C++, CMake and Swift runners, and a single vendored bundle can outweigh a
 * year of TypeScript.
 */
export const fetchLanguages = async (
  token: string,
  fetchFn: Fetcher = globalThis.fetch,
  now = new Date()
): Promise<LanguageShare[]> => {
  const since = new Date(now)
  since.setUTCMonth(since.getUTCMonth() - LANGUAGE_WINDOW_MONTHS)

  const totals = new Map<string, number>()
  let cursor: string | null = null

  do {
    const data: {
      user: {
        repositories: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null }
          nodes: {
            pushedAt: string
            primaryLanguage: { name: string } | null
          }[]
        }
      }
    } = await graphql(
      token,
      `
        query Languages($login: String!, $cursor: String) {
          user(login: $login) {
            repositories(
              first: 100
              after: $cursor
              ownerAffiliations: OWNER
              isFork: false
              privacy: PUBLIC
            ) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                pushedAt
                primaryLanguage {
                  name
                }
              }
            }
          }
        }
      `,
      { login: GITHUB_LOGIN, cursor },
      fetchFn
    )

    for (const repo of data.user.repositories.nodes) {
      if (!repo.primaryLanguage || new Date(repo.pushedAt) < since) continue
      const name = repo.primaryLanguage.name
      totals.set(name, (totals.get(name) ?? 0) + 1)
    }

    const { hasNextPage, endCursor } = data.user.repositories.pageInfo
    cursor = hasNextPage ? endCursor : null
  } while (cursor)

  return [...totals.entries()]
    .map(([name, repos]) => ({ name, repos }))
    .sort((a, b) => b.repos - a.repos || a.name.localeCompare(b.name))
}

export const fetchSnapshot = async (
  token: string,
  pullRequestUrls: string[],
  fetchFn: Fetcher = globalThis.fetch
): Promise<GitHubSnapshot> => {
  const [activity, pullRequests, languages] = await Promise.all([
    fetchActivity(token, fetchFn),
    fetchPullRequestStats(token, pullRequestUrls, fetchFn),
    fetchLanguages(token, fetchFn),
  ])
  return { activity, pullRequests, languages }
}
