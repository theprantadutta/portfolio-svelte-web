<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/state'

  import Projects from '$components/Projects.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const title = 'Projects | Pranta Dutta'
  const description =
    'Products and tools Pranta Dutta has designed, built, and shipped — mobile apps, backend APIs, and cloud infrastructure.'

  // Read the filter straight off the URL, but only in the browser: the page is
  // prerendered to a single static file that cannot depend on a query string,
  // and SvelteKit enforces that by throwing on `url.searchParams` during
  // prerender. So the HTML ships with every project listed, and the filter is
  // applied on hydration — which also means switching tags costs no request.
  const selectedTags = $derived(
    browser
      ? (page.url.searchParams
          .get('tags')
          ?.split(',')
          .map((t) => t.trim())
          .filter(Boolean) ?? [])
      : []
  )

  const filteredProjects = $derived(
    selectedTags.length > 0
      ? data.projects.filter((project) =>
          project.Tags.some((tag) =>
            selectedTags.some(
              (st) => tag.name.toLowerCase() === st.toLowerCase()
            )
          )
        )
      : data.projects
  )
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://pranta.dev/projects" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="https://pranta.dev/projects" />
</svelte:head>

<main class="flex scroll-mt-36 flex-col items-center px-4 pt-4 sm:pt-8">
  <Projects
    showAllProjects={true}
    projects={filteredProjects}
    allTags={data.allTags}
    {selectedTags}
  />
</main>
