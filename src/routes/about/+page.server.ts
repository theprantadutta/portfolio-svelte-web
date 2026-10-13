import { allPullRequests } from '#lib/data/open-source.js'
import { releases } from '#lib/data/profile.js'
import { LANGUAGE_WINDOW_MONTHS } from '#lib/github.js'
import { isPublicApp, languageColor } from '#lib/projects.js'
import { getGitHubSnapshot } from '#lib/server/github.js'
import { getAllProjects } from '#lib/server/strapi.js'
import type { PageServerLoad } from './$types'

const TOP_LANGUAGES = 5

/**
 * Whole-number percentages that still add up to 100: floor everything, then
 * hand the leftover points to the largest remainders.
 */
const toPercentages = (counts: number[]) => {
  const total = counts.reduce((sum, n) => sum + n, 0)
  if (total === 0) return counts.map(() => 0)

  const exact = counts.map((n) => (n / total) * 100)
  const floored = exact.map(Math.floor)
  let leftover = 100 - floored.reduce((sum, n) => sum + n, 0)

  exact
    .map((value, i) => ({ i, remainder: value - floored[i] }))
    .sort((a, b) => b.remainder - a.remainder)
    .forEach(({ i }) => {
      if (leftover-- > 0) floored[i]++
    })

  return floored
}

export const load: PageServerLoad = async ({ fetch }) => {
  const [projects, github] = await Promise.all([
    getAllProjects({ fetch }),
    getGitHubSnapshot(),
  ])

  const apps = projects.data.filter(isPublicApp).length
  const prs = allPullRequests().length

  const top = github.languages.slice(0, TOP_LANGUAGES)
  const rest = github.languages
    .slice(TOP_LANGUAGES)
    .reduce((sum, language) => sum + language.repos, 0)
  const entries = [
    ...top.map((language) => ({
      name: language.name,
      repos: language.repos,
      color: languageColor(language.name),
    })),
    ...(rest > 0
      ? [{ name: 'Other', repos: rest, color: 'var(--lang-other)' }]
      : []),
  ]
  const percents = toPercentages(entries.map((entry) => entry.repos))

  return {
    releases: releases.map((release) => ({
      ...release,
      value: release.value
        .replace('{apps}', String(apps))
        .replace('{prs}', String(prs)),
    })),
    languages: entries.map((entry, i) => ({ ...entry, percent: percents[i] })),
    languageWindowMonths: LANGUAGE_WINDOW_MONTHS,
  }
}
