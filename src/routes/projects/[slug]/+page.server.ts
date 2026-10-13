import { error } from '@sveltejs/kit'

import { getStrapiMedia } from '$lib/constants/urls'
import { projectChangelog, toProjectSummary } from '$lib/projects'
import { getAllProjectSlugs, getProjectBySlug } from '$lib/server/strapi'
import type { EntryGenerator, PageServerLoad } from './$types'

/**
 * The SvelteKit equivalent of `generateStaticParams`: tells the prerenderer
 * which slugs exist, so every project page is written out as a static file at
 * build time.
 */
export const entries: EntryGenerator = async () => {
  const projects = await getAllProjectSlugs()
  return projects.map(({ slug }) => ({ slug }))
}

type Media = { url?: string; mime?: string } | null | undefined

const isVideo = (media: Media) =>
  media?.mime
    ? media.mime.startsWith('video/')
    : /\.(mp4|webm|mov)$/i.test(media?.url ?? '')

export const load: PageServerLoad = async ({ params, fetch }) => {
  // Do NOT catch here: a genuine "not found" returns null below (→ 404), while
  // a real fetch/HTTP failure throws and fails the build with the exact slug
  // and status, rather than silently baking a 404 page.
  const project = await getProjectBySlug(params.slug, { fetch })

  if (!project) {
    error(404, 'Project not found')
  }

  const videos = [...(project.imageUrls ?? []), ...(project.video ?? [])]
    .map((media) => media as Media)
    .filter(isVideo)
    .map((media) => ({
      url: getStrapiMedia(media?.url ?? null) ?? '',
      mime: media?.mime ?? 'video/mp4',
    }))
    .filter((video) => video.url)

  return {
    project: toProjectSummary(project),
    detail: {
      longDescription: project.longDescription ?? null,
      googlePlayLink: project.googlePlayLink || null,
      appStoreLink: project.appStoreLink || null,
      githubLink: project.githubLink || null,
      platformType: project.platformType,
      developerRole: project.developerRole,
      complexity: project.complexity,
      startDate: project.startDate,
      endDate: project.endDate ?? null,
      tags: (project.Tags ?? []).map((tag) => tag.name.trim()),
      features: (project.features ?? []).map((feature) => feature.flag),
      videos,
    },
    changelog: projectChangelog(project),
  }
}
