import { getMostLikedArticles } from '$lib/devto'
import { getAllFeaturedProjects } from '$lib/server/strapi'
import type { PageServerLoad } from './$types'

// Runs once at build time (the whole route tree is prerendered), so these
// upstream requests happen during `vite build` and never on a page view.
//
// Projects is the only Strapi collection left. Experience and skills are local
// data under src/lib/data/, imported directly by the components that render
// them — a CMS bought nothing for either, since prerendering means a rebuild is
// needed to publish a change regardless.
export const load: PageServerLoad = async ({ fetch }) => {
  const [projects, popularBlogs] = await Promise.all([
    getAllFeaturedProjects({ fetch }),
    getMostLikedArticles(3, fetch),
  ])

  return {
    projects: projects.data,
    popularBlogs,
  }
}
