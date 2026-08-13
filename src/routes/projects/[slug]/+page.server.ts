import { error } from '@sveltejs/kit'

import { getAllProjectSlugs, getProjectBySlug } from '$lib/server/strapi'
import type { EntryGenerator, PageServerLoad } from './$types'

/**
 * The SvelteKit equivalent of `generateStaticParams`: tells the prerenderer
 * which slugs exist, so every project page is written out as a static file at
 * build time.
 */
export const entries: EntryGenerator = async () => {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const load: PageServerLoad = async ({ params, fetch }) => {
  // Do NOT catch here: a genuine "not found" returns null below (→ 404), while
  // a real fetch/HTTP failure throws and fails the build with the exact slug
  // and status, rather than silently baking a 404 page.
  const project = await getProjectBySlug(params.slug, { fetch })

  if (!project) {
    error(404, 'Project not found')
  }

  return { project }
}
