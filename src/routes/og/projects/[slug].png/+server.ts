import { error } from '@sveltejs/kit'

import { projectKind } from '#lib/projects.js'
import { renderOgCard } from '#lib/server/og.js'
import { getAllProjects, getAllProjectSlugs } from '#lib/server/strapi.js'
import type { EntryGenerator, RequestHandler } from './$types'

// A share card for every project page, prerendered alongside it.
export const prerender = true

export const entries: EntryGenerator = async () =>
  (await getAllProjectSlugs()).map(({ slug }) => ({ slug }))

export const GET: RequestHandler = async ({ params, fetch }) => {
  const projects = await getAllProjects({ fetch })
  const project = projects.data.find((p) => p.slug === params.slug)
  if (!project) error(404, 'No such project')

  const year = project.startDate?.slice(0, 4)
  const accent =
    project.metric?.trim() ||
    [projectKind(project), year].filter(Boolean).join(' · ')

  return renderOgCard({
    command: `$ cat ~/projects/${project.slug}/README.md`,
    title: project.title,
    accent,
    hue: 'orange',
  })
}
