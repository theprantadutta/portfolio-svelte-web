<script lang="ts">
  import Menu from '@lucide/svelte/icons/menu'
  import { onMount, tick } from 'svelte'
  import { Spring } from 'svelte/motion'
  import { page } from '$app/state'

  import ThemeToggle from '#components/chrome/ThemeToggle.svelte'
  import Avatar from '#components/ui/Avatar.svelte'
  import { ui } from '#lib/context/ui.svelte.js'
  import { SPRING_UI } from '#lib/motion/index.js'
  import { scramble } from '#lib/motion/scramble.js'
  import { SITE_ROUTES, postFileName, routeFor } from '#lib/site-nav.js'

  const active = $derived(routeFor(page.url.pathname))
  const isHome = $derived(page.url.pathname === '/')

  /** Detail pages swap the brand for a breadcrumb back to their list. */
  const crumb = $derived.by(() => {
    const slug = page.params.slug
    if (!slug) return null
    if (active === 'projects') {
      return { back: 'projects', href: '/projects', current: slug }
    }
    if (active === 'blog') {
      return { back: 'blog', href: '/blogs', current: postFileName(slug) }
    }
    return null
  })

  const activeLabel = $derived(
    SITE_ROUTES.find((route) => route.id === active)?.label ?? '~/'
  )

  // --- Sticky behaviour (MOTION §5) ----------------------------------------
  // Transparent at the top; after 24px it gains a blurred backdrop and a
  // border. Scrolling down past 400px tucks it away; any scroll up brings it
  // back. Reads window.scrollY, which Lenis keeps current, so the two never
  // disagree about where the page is.
  let scrolled = $state(false)
  let tucked = $state(false)
  let header: HTMLElement

  onMount(() => {
    let lastY = window.scrollY
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      scrolled = y > 24
      const focusInside = header.contains(document.activeElement)
      if (y < 400 || focusInside || ui.menuOpen) tucked = false
      else if (y > lastY + 4) tucked = true
      else if (y < lastY - 4) tucked = false
      lastY = y
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  })

  // --- The sliding underline (MOTION §3) -------------------------------------
  // One bar that springs between the active links. Before hydration each
  // link draws its own underline, so the prerendered page is already right;
  // once measured, the shared bar takes over.
  let links: HTMLElement
  let sliding = $state(false)
  const bar = new Spring({ x: 0, w: 0 }, SPRING_UI)

  const measure = (instant: boolean) => {
    const current = links?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!current) return
    bar.set({ x: current.offsetLeft, w: current.offsetWidth }, { instant })
  }

  $effect(() => {
    void active
    tick().then(() => {
      measure(!sliding)
      sliding = true
    })
  })

  onMount(() => {
    const observer = new ResizeObserver(() => measure(true))
    observer.observe(links)
    return () => observer.disconnect()
  })

  const openMenu = (event: MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    ui.openMenu({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }
</script>

<header
  bind:this={header}
  class="nav enter-down"
  class:scrolled
  class:tucked
  style:--d="0ms"
>
  <div class="container-page row">
    <!-- Left: brand, or a breadcrumb on detail pages -->
    <div class="left">
      {#if crumb}
        <a class="crumb-desktop" href={crumb.href}>
          <span class="muted">← {crumb.back} /</span>
          <b class="current">{crumb.current}</b>
        </a>
        <a class="back-mobile" href={crumb.href}>← {crumb.back}</a>
      {:else}
        <!-- No aria-label: the accessible name must contain the visible text. -->
        <a class="brand" class:sub={!isHome} href="/">
          <Avatar size={30} transitionName="nav-avatar" priority />
          <span class="brand-desktop">
            pranta<span class="muted slash">/</span>portfolio
          </span>
          <span class="brand-mobile">
            {#if isHome}
              pranta/portfolio
            {:else}
              <span class="muted">~/</span>{activeLabel.slice(2)}
            {/if}
          </span>
          {#if isHome}
            <span class="pill public">public</span>
          {/if}
          <span class="sr-only">(home)</span>
        </a>
      {/if}
    </div>

    <!-- Centre: the routes -->
    <nav aria-label="Primary" class="links" bind:this={links} class:sliding>
      {#each SITE_ROUTES as route (route.id)}
        <a
          href={route.href}
          class="link"
          aria-current={route.id === active ? 'page' : undefined}
        >
          {route.label}
        </a>
      {/each}
      <span
        class="bar"
        aria-hidden="true"
        style:transform="translateX({bar.current.x}px) scaleX({bar.current.w /
          100})"
        style:opacity={active ? 1 : 0}
      ></span>
    </nav>

    <!-- Right: theme + hire, or the menu button below 1024px -->
    <div class="right">
      <ThemeToggle />
      {#if active !== 'contact'}
        <a class="hire" href="/contact">
          <span use:scramble>git push hire</span>
        </a>
      {/if}
    </div>

    <button
      type="button"
      class="menu-button"
      onclick={openMenu}
      aria-label="Open menu"
      aria-expanded={ui.menuOpen}
      aria-controls="mobile-menu"
    >
      <Menu size={18} strokeWidth={1.75} />
    </button>
  </div>
</header>

<style>
  .nav {
    position: sticky;
    top: 0;
    z-index: 40;
    height: 72px;
    font-family: var(--font-mono);
    font-size: 14px;
    transition: transform 250ms var(--ease-out);
  }

  /* The backdrop fades in on its own layer so the bar's text never blurs. */
  .nav::before {
    content: '';
    position: absolute;
    inset: 0;
    background: color-mix(in oklch, var(--bg) 80%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    opacity: 0;
    transition: opacity var(--dur-2) linear;
  }

  .nav.scrolled::before {
    opacity: 1;
  }

  .nav.tucked {
    transform: translateY(-100%);
  }

  .row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 100%;
    /* At the very top the row sits where the design has it (42px down);
       once the bar has a background it centres in it. */
    transform: translateY(6px);
    transition: transform var(--dur-2) var(--ease-out);
  }

  .nav.scrolled .row {
    transform: none;
  }

  .left {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    white-space: nowrap;
  }

  .muted {
    color: var(--ink-4);
  }

  .slash {
    margin-inline: 0.6ch;
  }

  .public {
    font-size: 11px;
    padding: 2px 8px;
  }

  .crumb-desktop {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    white-space: nowrap;
  }

  .crumb-desktop .current {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
  }

  .back-mobile {
    display: none;
  }

  .links {
    position: relative;
    display: flex;
    gap: 22px;
  }

  .link {
    position: relative;
    padding-bottom: 4px;
    color: var(--ink-3);
    white-space: nowrap;
    transition: color var(--dur-1) linear;
  }

  .link:hover,
  .link[aria-current='page'] {
    color: var(--ink);
  }

  /* Each link's own underline: the active one before hydration, and a faint
     preview on hover. */
  .link::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 2px;
    background: var(--orange);
    opacity: 0;
    transition: opacity var(--dur-2) linear;
  }

  .link:hover::after {
    opacity: 0.35;
  }

  .link[aria-current='page']::after {
    opacity: 1;
  }

  .links.sliding .link[aria-current='page']::after {
    opacity: 0;
  }

  .bar {
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100px;
    height: 2px;
    background: var(--orange);
    transform-origin: left;
    pointer-events: none;
    visibility: hidden;
  }

  .links.sliding .bar {
    visibility: visible;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hire {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 8px;
    background: var(--ink);
    color: var(--on-ink);
    white-space: nowrap;
    transition: transform var(--dur-2) var(--ease-out);
  }

  .hire:active {
    transform: scale(0.97);
  }

  .menu-button {
    display: none;
  }

  .brand-mobile {
    display: none;
  }

  /* Between 1024 and ~1200px all three groups don't fit at full size. */
  @media (max-width: 1199px) {
    .links {
      gap: 16px;
    }

    .brand-desktop,
    .public {
      display: none;
    }

    .crumb-desktop .current {
      max-width: 180px;
    }
  }

  @media (max-width: 1023px) {
    .nav {
      height: 64px;
      font-size: 13px;
    }

    .row {
      transform: none;
    }

    .links,
    .right,
    .crumb-desktop,
    .public {
      display: none;
    }

    .brand-mobile {
      display: inline;
    }

    .brand {
      gap: 8px;
      font-weight: 400;
    }

    /* Subpages show just "~/route" on small screens. */
    .brand.sub :global(.avatar) {
      display: none;
    }

    .back-mobile {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 14px;
      border-radius: 12px;
      border: 1px solid var(--border-strong);
      background: var(--surface);
    }

    .menu-button {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 1px solid var(--border-strong);
      background: var(--surface);
      color: var(--ink);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav,
    .row {
      transition: none;
    }
  }
</style>
