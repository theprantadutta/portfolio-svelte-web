import { getAllArticles } from '$lib/devto'
import type { PageServerLoad } from './$types'

// Baked at build time so the list paints instantly with no request. The page
// then revalidates against dev.to in the browser — see +page.svelte.
export const load: PageServerLoad = async ({ fetch }) => {
  const articles = await getAllArticles(fetch)
  return { articles }
}
