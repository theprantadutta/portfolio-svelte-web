import { toProjectSummary } from '$lib/projects'
import { getAllProjects } from '$lib/server/strapi'
import type { PageServerLoad } from './$types'

/**
 * Every project, baked at build time and trimmed to what the cards render.
 *
 * Filtering by `?type=` happens in the browser against this list, so the
 * page stays one static file. See +page.svelte.
 */
export const load: PageServerLoad = async ({ fetch }) => {
  const projects = await getAllProjects({ fetch })
  return { projects: projects.data.map(toProjectSummary) }
}
