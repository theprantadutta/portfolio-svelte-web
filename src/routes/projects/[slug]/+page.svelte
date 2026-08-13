<script lang="ts">
  import ProjectDetail from '$components/ProjectDetail.svelte'
  import { getStrapiMedia } from '$lib/constants/urls'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const project = $derived(data.project)
  const title = $derived(`${project.title} | Pranta Dutta`)
  const description = $derived(
    project.description || 'A showcase of problem-solving and creativity.'
  )
  const url = $derived(`https://pranta.dev/projects/${project.slug}`)
  const image = $derived(
    getStrapiMedia(
      project.cover?.formats?.large?.url ||
        project.cover?.formats?.medium?.url ||
        null
    )
  )
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />

  <meta property="og:type" content="article" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  {#if image}
    <meta property="og:image" content={image} />
  {/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#if image}
    <meta name="twitter:image" content={image} />
  {/if}
</svelte:head>

<ProjectDetail {project} />
