/**
 * Rewrites src/lib/data/github.snapshot.json from the live GitHub API.
 *
 * The snapshot is what the site renders when a build runs without a
 * GITHUB_TOKEN, or GitHub is down, so it should be refreshed now and then to
 * keep that fallback recent:
 *
 *   GITHUB_TOKEN=$(gh auth token) bun scripts/refresh-github-snapshot.ts
 *
 * Any token that can read public data works.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { contributedRepos, pullRequestUrls } from '../src/lib/data/open-source'
import { fetchSnapshot } from '../src/lib/github'

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error('GITHUB_TOKEN is not set. Try: GITHUB_TOKEN=$(gh auth token)')
  process.exit(1)
}

const snapshot = await fetchSnapshot(
  token,
  pullRequestUrls(),
  contributedRepos()
)

const target = fileURLToPath(
  new URL('../src/lib/data/github.snapshot.json', import.meta.url)
)
writeFileSync(target, JSON.stringify(snapshot, null, 2) + '\n')

console.log(
  `Wrote ${target}: ${snapshot.activity.total} contributions, ` +
    `${Object.keys(snapshot.pullRequests).length} pull requests, ` +
    `${Object.keys(snapshot.repositories).length} repositories, ` +
    `${snapshot.languages.length} languages`
)
