import { getMostLikedArticles } from '$lib/devto'
import {
  getAllExperiences,
  getAllFeaturedProjects,
  getAllSkills,
} from '$lib/server/strapi'
import type { PageServerLoad } from './$types'

// Runs once at build time (the whole route tree is prerendered), so the four
// upstream requests happen during `vite build` and never on a page view.
export const load: PageServerLoad = async ({ fetch }) => {
  const [experiences, projects, skills, popularBlogs] = await Promise.all([
    getAllExperiences({ fetch }),
    getAllFeaturedProjects({ fetch }),
    getAllSkills({ fetch }),
    getMostLikedArticles(3, fetch),
  ])

  return {
    experiences: experiences.data,
    projects: projects.data,
    skills: skills.data,
    popularBlogs,
  }
}
