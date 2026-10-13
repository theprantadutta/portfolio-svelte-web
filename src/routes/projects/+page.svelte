<script lang="ts">
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { cubicOut } from 'svelte/easing'
  import { replaceState } from '$app/navigation'
  import { page } from '$app/state'

  import PageGlow from '$components/chrome/PageGlow.svelte'
  import FilterPills from '$components/projects/FilterPills.svelte'
  import PinnedProject from '$components/projects/PinnedProject.svelte'
  import ProjectCard from '$components/projects/ProjectCard.svelte'
  import PageHeader from '$components/ui/PageHeader.svelte'
  import { prefersReducedMotion } from '$lib/motion'
  import { reveal } from '$lib/motion/reveal'
  import {
    PROJECT_FILTERS,
    type ProjectFilter,
    type ProjectSummary,
  } from '$lib/projects'
  import { SITE_URL } from '$lib/site'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let filter = $state<ProjectFilter>('All')

  // `?type=` is read in the browser only: page.url.searchParams throws during
  // prerendering, because a static file cannot depend on a query string.
  onMount(() => {
    const type = new URL(location.href).searchParams.get('type')
    const match = PROJECT_FILTERS.find(
      (f) => f.toLowerCase() === type?.toLowerCase()
    )
    if (match) filter = match
  })

  const matches = (project: ProjectSummary, f: ProjectFilter) =>
    f === 'All' || project.categories.includes(f)

  const counts = $derived(
    Object.fromEntries(
      PROJECT_FILTERS.map((f) => [
        f,
        data.projects.filter((p) => matches(p, f)).length,
      ])
    ) as Record<ProjectFilter, number>
  )

  const pinned = $derived(
    data.projects.find((p) => p.isFeatured) ?? data.projects[0]
  )
  const showPinned = $derived(pinned && matches(pinned, filter))
  const grid = $derived(
    data.projects.filter((p) => p !== pinned && matches(p, filter))
  )

  const choose = (next: ProjectFilter) => {
    filter = next
    const url = new URL(page.url)
    if (next === 'All') url.searchParams.delete('type')
    else url.searchParams.set('type', next.toLowerCase())
    // Shallow: the address bar follows the filter without a navigation.
    replaceState(url, page.state)
  }

  const reduced = () => prefersReducedMotion.current

  // Leaving cards are lifted out of the grid at their current spot so the
  // rest can FLIP into place while they fade (MOTION §4 "Filters").
  const leave = (node: HTMLElement) => {
    if (reduced()) return { duration: 0 }
    const parent = node.offsetParent as HTMLElement | null
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = node
    if (parent) {
      Object.assign(node.style, {
        position: 'absolute',
        left: `${offsetLeft}px`,
        top: `${offsetTop}px`,
        width: `${offsetWidth}px`,
        height: `${offsetHeight}px`,
      })
    }
    return {
      duration: 200,
      easing: cubicOut,
      css: (t: number) => `opacity: ${t}; transform: scale(${0.96 + 0.04 * t})`,
    }
  }

  const enter = (_node: Element, { delay = 0 }: { delay?: number } = {}) => ({
    delay: reduced() ? 0 : delay,
    duration: reduced() ? 150 : 360,
    easing: cubicOut,
    css: (t: number) =>
      reduced()
        ? `opacity: ${t}`
        : `opacity: ${t}; transform: translateY(${(1 - t) * 12}px)`,
  })

  const title = 'Projects | Pranta Dutta'
  const description = $derived(
    `${data.projects.length} shipped projects by Pranta Dutta: Flutter apps used by 20,000+ people, .NET and Go backends, AI gateways and assistants, games and developer tools.`
  )
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="{SITE_URL}/projects" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="{SITE_URL}/projects" />
  <meta property="og:image" content="{SITE_URL}/og/projects.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="{SITE_URL}/og/projects.png" />
</svelte:head>

<PageGlow
  glows={[
    { hue: 'orange', width: 700, height: 500, right: -200, top: 640, drift: 2 },
  ]}
/>

<div class="container-page page">
  <PageHeader
    command="$ ls ~/projects --sort=impact"
    title="Things I've shipped."
  >
    {#snippet aside()}
      <FilterPills
        options={PROJECT_FILTERS}
        value={filter}
        {counts}
        label="Filter projects"
        onchange={choose}
      />
    {/snippet}
  </PageHeader>

  <div class="content">
    {#if showPinned && pinned}
      <div class="enter" style:--d="360ms" in:enter out:leave>
        <PinnedProject project={pinned} />
      </div>
    {/if}

    {#if grid.length}
      <ul class="grid" use:reveal={{ stagger: true }}>
        {#each grid as project, i (project.slug)}
          <li
            animate:flip={{ duration: reduced() ? 0 : 420, easing: cubicOut }}
            in:enter={{ delay: Math.min(i, 8) * 40 }}
            out:leave
          >
            <ProjectCard {project} />
          </li>
        {/each}
      </ul>
    {:else if !showPinned}
      <p class="empty">
        <span class="muted">$ ls ~/projects --type={filter.toLowerCase()}</span
        ><br />
        Nothing here yet.
      </p>
    {/if}
  </div>
</div>

<style>
  .page {
    padding-bottom: 48px;
  }

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 26px;
    margin-top: 26px;
  }

  .grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .empty {
    margin: 0;
    padding: 40px 0;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.8;
    color: var(--ink-2);
  }

  .muted {
    color: var(--ink-4);
  }

  @media (max-width: 1023px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .content {
      gap: 14px;
      margin-top: 14px;
    }

    .grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
    }
  }
</style>
