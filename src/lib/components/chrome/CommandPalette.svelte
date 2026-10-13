<script lang="ts">
  import Search from '@lucide/svelte/icons/search'
  import { tick } from 'svelte'
  import { Spring } from 'svelte/motion'
  import { goto } from '$app/navigation'

  import { getThemeState } from '#lib/context/theme.svelte.js'
  import { ui } from '#lib/context/ui.svelte.js'
  import { profile } from '#lib/data/profile.js'
  import { prefersReducedMotion, SPRING_UI } from '#lib/motion/index.js'
  import { siteIndex } from '#lib/site-index.svelte.js'
  import { SITE_ROUTES } from '#lib/site-nav.js'
  import { lockScroll, unlockScroll } from '#lib/smooth-scroll.js'
  import { copyText } from '#lib/toast.svelte.js'

  const theme = getThemeState()

  type Group = 'page' | 'action' | 'project' | 'post'

  interface Item {
    id: string
    group: Group
    title: string
    meta: string
    /** Extra text the fuzzy match looks at, never shown */
    keywords?: string
    run: () => void
  }

  const PAGE_META: Record<string, string> = {
    home: 'commit log',
    about: 'readme',
    projects: 'things shipped',
    'open-source': 'merged PRs',
    blog: 'notes from shipping',
    skills: 'stack & experience',
    contact: 'open a pull request',
  }

  const pages: Item[] = SITE_ROUTES.map((route) => ({
    id: `page:${route.id}`,
    group: 'page',
    title: route.label,
    meta: PAGE_META[route.id],
    keywords: route.id,
    run: () => goto(route.href),
  }))

  const actions: Item[] = [
    {
      id: 'action:cv',
      group: 'action',
      title: 'Download CV',
      meta: 'pdf',
      keywords: 'resume curriculum vitae',
      run: () => {
        window.location.href = profile.cvPath
      },
    },
    {
      id: 'action:email',
      group: 'action',
      title: 'Copy email',
      meta: profile.email,
      keywords: 'mail contact',
      run: () => copyText(profile.email, 'email copied'),
    },
    {
      id: 'action:theme',
      group: 'action',
      title: 'Toggle theme',
      meta: 'light / dark',
      keywords: 'dark mode light mode',
      run: () => theme.toggle(),
    },
    {
      id: 'action:services',
      group: 'action',
      title: 'Services',
      meta: 'pdlabs ↗',
      keywords: 'hire freelance',
      run: () => window.open(profile.servicesUrl, '_blank', 'noopener'),
    },
  ]

  const projects = $derived<Item[]>(
    (siteIndex.data?.projects ?? []).map((project) => ({
      id: `project:${project.slug}`,
      group: 'project',
      title: project.title,
      meta: `${project.kind} · ${project.year}`,
      keywords: project.slug,
      run: () => goto(`/projects/${project.slug}`),
    }))
  )

  const posts = $derived<Item[]>(
    (siteIndex.data?.posts ?? []).map((post) => ({
      id: `post:${post.slug}`,
      group: 'post',
      title: post.title,
      meta: post.date,
      run: () => goto(`/blogs/${post.slug}`),
    }))
  )

  /**
   * Substring matches rank first (earlier is better), then in-order
   * subsequences, with a bonus for runs and for hitting word starts, so
   * "dsa" finds "display ads" and "kds" finds every KDS project.
   */
  const score = (query: string, text: string) => {
    const q = query.toLowerCase()
    const t = text.toLowerCase()
    const at = t.indexOf(q)
    if (at >= 0) return 1000 - at + (at === 0 ? 200 : 0)

    let from = 0
    let total = 0
    let run = 0
    for (const char of q) {
      if (char === ' ') continue
      const i = t.indexOf(char, from)
      if (i < 0) return 0
      run = i === from ? run + 1 : 0
      const wordStart = i === 0 || ' -/~.'.includes(t[i - 1])
      total += 1 + run * 2 + (wordStart ? 4 : 0)
      from = i + 1
    }
    // Letters scattered one by one through a long title are noise, not a
    // match: require roughly two points per letter, which only word starts
    // and runs provide.
    return total >= q.replace(/ /g, '').length * 2 ? total : 0
  }

  let query = $state('')

  const GROUP_LABEL: Record<Group, string> = {
    page: 'pages',
    action: 'actions',
    project: 'projects',
    post: 'posts',
  }

  const sections = $derived.by(() => {
    if (!query.trim()) {
      return [
        { label: 'pages', items: pages },
        { label: 'actions', items: actions },
        { label: 'projects', items: projects.slice(0, 5) },
        { label: 'recent posts', items: posts.slice(0, 5) },
      ].filter((section) => section.items.length > 0)
    }

    const ranked = [...pages, ...actions, ...projects, ...posts]
      .map((item) => ({
        item,
        score: Math.max(
          score(query, item.title),
          score(query, `${item.keywords ?? ''} ${item.meta}`) * 0.6
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map((entry) => entry.item)

    return ranked.length ? [{ label: 'results', items: ranked }] : []
  })

  const flat = $derived(sections.flatMap((section) => section.items))

  let activeIndex = $state(0)
  $effect(() => {
    void query
    activeIndex = 0
  })

  let input = $state<HTMLInputElement>()
  let list = $state<HTMLElement>()
  let dialog = $state<HTMLElement>()
  const highlight = new Spring({ y: 0, h: 0 }, SPRING_UI)
  let highlightReady = $state(false)

  // The highlight bar slides between rows rather than jumping.
  $effect(() => {
    const id = flat[activeIndex]?.id
    if (!id || !list) return
    tick().then(() => {
      const row = list?.querySelector<HTMLElement>(
        `[data-id="${CSS.escape(id)}"]`
      )
      if (!row) return
      highlight.set(
        { y: row.offsetTop, h: row.offsetHeight },
        { instant: !highlightReady || prefersReducedMotion.current }
      )
      highlightReady = true
      row.scrollIntoView({ block: 'nearest' })
    })
  })

  $effect(() => {
    if (!ui.paletteOpen) return
    lockScroll()
    query = ''
    highlightReady = false
    siteIndex.load().catch(() => {
      // Pages and actions still work without the index.
    })
    tick().then(() => input?.focus())
    return unlockScroll
  })

  const run = (item: Item | undefined) => {
    if (!item) return
    ui.closePalette()
    item.run()
  }

  const onKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        activeIndex = (activeIndex + 1) % Math.max(flat.length, 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        activeIndex = (activeIndex - 1 + flat.length) % Math.max(flat.length, 1)
        break
      case 'Home':
        event.preventDefault()
        activeIndex = 0
        break
      case 'End':
        event.preventDefault()
        activeIndex = Math.max(flat.length - 1, 0)
        break
      case 'Enter':
        event.preventDefault()
        run(flat[activeIndex])
        break
      case 'Escape':
        event.preventDefault()
        ui.closePalette()
        break
      case 'Tab': {
        // The input and the result rows are the only stops; keep focus here.
        const focusables = Array.from(
          dialog?.querySelectorAll<HTMLElement>('input, button') ?? []
        )
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
        break
      }
    }
  }

  const pop = (_node: Element) => ({
    duration: prefersReducedMotion.current ? 0 : 200,
    css: (t: number) => `opacity: ${t}; transform: scale(${0.98 + t * 0.02})`,
  })

  const fade = (_node: Element) => ({
    duration: prefersReducedMotion.current ? 0 : 200,
    css: (t: number) => `opacity: ${t}`,
  })

  const indexOf = (item: Item) => flat.indexOf(item)
</script>

{#if ui.paletteOpen}
  <div
    class="backdrop"
    transition:fade
    onclick={ui.closePalette}
    aria-hidden="true"
  ></div>
  <div
    bind:this={dialog}
    class="palette"
    role="dialog"
    aria-modal="true"
    aria-label="Command palette"
    tabindex="-1"
    transition:pop
    onkeydown={onKeydown}
  >
    <div class="search">
      <Search size={16} strokeWidth={1.75} />
      <input
        bind:this={input}
        bind:value={query}
        type="text"
        placeholder="jump to a page, project or post…"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        aria-activedescendant={flat[activeIndex]
          ? `palette-${activeIndex}`
          : undefined}
        aria-autocomplete="list"
        autocomplete="off"
        spellcheck="false"
      />
      <span class="kbd">esc</span>
    </div>

    <div
      class="list"
      id="palette-list"
      role="listbox"
      bind:this={list}
      data-lenis-prevent
    >
      {#if flat.length > 0}
        <span
          class="highlight"
          aria-hidden="true"
          style:transform="translateY({highlight.current.y}px)"
          style:height="{highlight.current.h}px"
        ></span>
      {/if}

      {#each sections as section (section.label)}
        <div class="section" role="presentation">{section.label}</div>
        {#each section.items as item (item.id)}
          {@const index = indexOf(item)}
          <button
            type="button"
            id="palette-{index}"
            class="row"
            role="option"
            aria-selected={index === activeIndex}
            data-id={item.id}
            tabindex="-1"
            onpointermove={() => (activeIndex = index)}
            onclick={() => run(item)}
          >
            <span class="title">{item.title}</span>
            <span class="meta">
              {query.trim() ? `${GROUP_LABEL[item.group]} · ` : ''}{item.meta}
            </span>
          </button>
        {/each}
      {:else}
        <p class="empty">
          No match for “{query}”.
          <span class="muted">git grep came back empty.</span>
        </p>
      {/each}
    </div>

    <div class="hints" aria-hidden="true">
      <span><span class="kbd">↑</span> <span class="kbd">↓</span> move</span>
      <span><span class="kbd">↵</span> open</span>
      <span
        ><span class="kbd">ctrl</span> <span class="kbd">k</span> toggle</span
      >
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: color-mix(in oklch, var(--bg) 45%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .palette {
    position: fixed;
    z-index: 71;
    top: min(12vh, 120px);
    left: 50%;
    width: min(640px, calc(100vw - 2 * var(--gutter)));
    translate: -50% 0;
    display: flex;
    flex-direction: column;
    max-height: min(560px, calc(100dvh - 24vh));
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
    box-shadow:
      var(--shadow-card-lift),
      0 40px 80px -40px rgb(0 0 0 / 0.35);
    overflow: hidden;
    transform-origin: 50% 0;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--divider);
    color: var(--ink-3);
  }

  .search input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: 0;
    outline: none;
    color: var(--ink);
    font-family: var(--font-mono);
    font-size: 15px;
    caret-color: var(--blue);
  }

  .search input::placeholder {
    color: var(--ink-4);
  }

  .list {
    position: relative;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 6px 8px 8px;
  }

  .highlight {
    position: absolute;
    left: 8px;
    right: 8px;
    top: 0;
    border-radius: 10px;
    background: var(--chip);
    pointer-events: none;
  }

  .section {
    padding: 12px 10px 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-4);
  }

  .row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    min-height: 40px;
    padding: 9px 12px;
    border-radius: 10px;
    text-align: left;
  }

  .title {
    font-size: 15px;
    font-weight: 500;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row[aria-selected='true'] .title {
    color: var(--ink);
  }

  .meta {
    flex: none;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-4);
  }

  .empty {
    margin: 0;
    padding: 24px 12px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-2);
  }

  .muted {
    color: var(--ink-4);
  }

  .hints {
    display: flex;
    gap: 16px;
    padding: 10px 16px;
    border-top: 1px solid var(--divider);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-4);
  }

  .hints .kbd {
    font-size: 11px;
  }

  @media (max-width: 767px) {
    .hints {
      display: none;
    }
  }
</style>
