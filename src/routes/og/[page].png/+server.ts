import { error } from '@sveltejs/kit'

import { allPullRequests } from '#lib/data/open-source.js'
import { home, profile } from '#lib/data/profile.js'
import { getAllArticles } from '#lib/devto.js'
import { renderOgCard, type OgCard } from '#lib/server/og.js'
import { getAllProjects } from '#lib/server/strapi.js'
import type { EntryGenerator, RequestHandler } from './$types'

// One share card per top-level page, written out as PNGs at build time.
export const prerender = true

const PAGES = [
  'home',
  'about',
  'projects',
  'open-source',
  'blogs',
  'skills',
  'contact',
] as const

export const entries: EntryGenerator = () => PAGES.map((page) => ({ page }))

export const GET: RequestHandler = async ({ params, fetch }) => {
  const [projects, articles] = await Promise.all([
    getAllProjects({ fetch }),
    getAllArticles(fetch),
  ])
  const apps = home.headlineAccent.replace('{n}', String(projects.data.length))
  const prs = allPullRequests().length

  const cards: Record<(typeof PAGES)[number], OgCard> = {
    home: { command: '$ git log --graph', title: home.headline, accent: apps },
    about: {
      command: '$ cat README.md',
      title: "Hi, I'm Pranta Dutta",
      accent: `${profile.role}.`,
      hue: 'blue',
    },
    projects: {
      command: '$ ls ~/projects --sort=impact',
      title: "Things I've shipped.",
      accent: apps,
      hue: 'orange',
    },
    'open-source': {
      command: '$ gh pr list --author=@me --state=merged',
      title: `${prs} merged pull requests.`,
      accent: 'Flutter SDK, DevTools & more.',
      hue: 'purple',
    },
    blogs: {
      command: '$ cat ~/blog/*.md',
      title: 'Notes from shipping.',
      accent: `${articles.length} posts on dev.to.`,
      hue: 'orange',
    },
    skills: {
      command: '$ git branch -a --sort=-committerdate',
      title: 'Stack & branches.',
      accent: 'Flutter · .NET · Go · AI',
      hue: 'blue',
    },
    contact: {
      command: '$ git checkout -b let-us-work-together',
      title: 'Open a pull request.',
      accent: profile.openToWork ? 'Open to remote roles.' : undefined,
    },
  }

  const card = cards[params.page as (typeof PAGES)[number]]
  if (!card) error(404, 'No such card')

  return renderOgCard(card)
}
