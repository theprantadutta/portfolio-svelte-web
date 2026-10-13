/**
 * The site's searchable index (every page, project and post) as served by the
 * prerendered /search.json. Loaded on first need by the command palette and
 * the mobile menu's counts, then shared. Keeping it out of the layout's data
 * means no page pays for the full project and post lists in its HTML.
 */

export interface SiteIndex {
  projects: { slug: string; title: string; kind: string; year: string }[]
  posts: { slug: string; title: string; date: string; minutes: number }[]
  counts: { projects: number; posts: number; prs: number }
}

class SiteIndexStore {
  data = $state<SiteIndex | null>(null)
  #pending: Promise<SiteIndex> | null = null

  load = () =>
    (this.#pending ??= fetch('/search.json')
      .then((response) => {
        if (!response.ok) throw new Error(`search.json: ${response.status}`)
        return response.json() as Promise<SiteIndex>
      })
      .then((index) => (this.data = index))
      .catch((error) => {
        // Let the next open try again rather than caching the failure.
        this.#pending = null
        throw error
      }))
}

export const siteIndex = new SiteIndexStore()
