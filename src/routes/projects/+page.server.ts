import { getAllProjects } from '$lib/server/strapi'
import type { PageServerLoad } from './$types'

function getUniqueTags(
  projects: { Tags: { id: number; name: string }[] }[]
): string[] {
  const seen = new Map<string, string>()
  for (const project of projects) {
    for (const tag of project.Tags) {
      const key = tag.name.toLowerCase()
      if (!seen.has(key)) {
        seen.set(key, tag.name)
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  )
}

/**
 * The full project list plus every distinct tag, baked at build time.
 *
 * The Next version also read `?tags=` here and returned a filtered list, which
 * is what stopped the page from being static. Filtering now happens in the
 * browser against this same list — see +page.svelte.
 */
export const load: PageServerLoad = async ({ fetch }) => {
  const projects = await getAllProjects({ fetch })

  return {
    projects: projects.data,
    allTags: getUniqueTags(projects.data),
  }
}
