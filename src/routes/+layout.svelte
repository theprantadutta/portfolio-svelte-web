<script lang="ts">
  import type { Snippet } from 'svelte'
  import { onMount } from 'svelte'
  import { afterNavigate, onNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import '../app.css'

  // Imported for their built URLs so the preload hints below can name the
  // fingerprinted files.
  import geistUrl from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'

  import geistMonoUrl from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url'
  import Nav from '#components/chrome/Nav.svelte'
  import NavProgress from '#components/chrome/NavProgress.svelte'
  import Toaster from '#components/chrome/Toaster.svelte'
  import StructuredData from '#components/StructuredData.svelte'
  import { setThemeState } from '#lib/context/theme.svelte.js'
  import { ui } from '#lib/context/ui.svelte.js'
  import { prefersReducedMotion } from '#lib/motion/index.js'
  import { siteIndex } from '#lib/site-index.svelte.js'
  import { startSmoothScroll } from '#lib/smooth-scroll.js'

  let { children }: { children: Snippet } = $props()

  setThemeState()

  /**
   * The palette and the mobile menu are only needed once someone opens them,
   * so they stay out of the code every page evaluates on load. They are
   * fetched when the page goes idle (or the moment one is opened first), so
   * opening still feels instant.
   */
  type Lazy = typeof import('#components/chrome/CommandPalette.svelte').default

  let CommandPalette = $state<Lazy | null>(null)
  let MobileMenu = $state<Lazy | null>(null)

  const loadOverlays = () =>
    Promise.all([
      import('#components/chrome/CommandPalette.svelte'),
      import('#components/chrome/MobileMenu.svelte'),
    ]).then(([palette, menu]) => {
      CommandPalette = palette.default
      MobileMenu = menu.default
    })

  $effect(() => {
    if ((ui.paletteOpen || ui.menuOpen) && !CommandPalette) loadOverlays()
  })

  onMount(() => {
    let stop = () => {}

    startSmoothScroll().then((cleanup) => (stop = cleanup))

    // Warm the overlays and the search index once the page is idle, so the
    // palette and the mobile menu's counts are instant when first opened.
    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500))
    idle(() => {
      loadOverlays()
      siteIndex.load().catch(() => {})
    })

    return () => stop()
  })

  /**
   * Route changes run through the View Transitions API where it exists
   * (MOTION §3): the old page fades out over 160ms while the new one plays
   * its own entrances, and anything sharing a view-transition-name (project
   * screenshots and titles, blog covers and titles, the nav avatar) morphs
   * between the two. Query-string changes (filters, search) are not page
   * changes and skip it.
   */
  onNavigate((navigation) => {
    if (navigation.shallow && navigation.type === 'goto') return
    if (!document.startViewTransition || prefersReducedMotion.current) return
    if (navigation.from?.url.pathname === navigation.to?.url.pathname) return

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
    })
  })

  afterNavigate(({ shallow, type }) => {
    if (shallow && type === 'goto') return

    ui.closeMenu()
    ui.closePalette()
  })

  const isTyping = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

  /** ⌘K / Ctrl+K anywhere, or `/` when not typing (the blog uses `/` itself). */
  const onKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      if (ui.paletteOpen) ui.closePalette()
      else ui.openPalette()
      return
    }

    if (
      event.key === '/' &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !isTyping(event.target) &&
      !ui.paletteOpen &&
      page.route.id !== '/blogs'
    ) {
      event.preventDefault()
      ui.openPalette()
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
  <!--
    Preload both faces: Geist sets every headline and Geist Mono the nav, so
    both are above the fold on every page. Without the hints the browser only
    discovers them after app.css has parsed. `crossorigin` is required even
    same-origin, or the font is fetched twice.
  -->
  <link
    rel="preload"
    href={geistUrl}
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  />
  <link
    rel="preload"
    href={geistMonoUrl}
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  />

  <meta name="author" content="Pranta Dutta" />
  <meta name="creator" content="Pranta Dutta" />
  <meta
    name="robots"
    content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
  />
  <meta property="og:site_name" content="Pranta Dutta" />
  <meta property="og:locale" content="en_US" />
</svelte:head>

<div class="app">
  <div class="grid-bg" aria-hidden="true"></div>
  <a class="skip" href="#main">Skip to content</a>

  <NavProgress />
  <Nav />

  <main id="main" tabindex="-1">
    {@render children()}
  </main>
  {#if MobileMenu}
    <MobileMenu />
  {/if}

  {#if CommandPalette}
    <CommandPalette />
  {/if}

  <Toaster />
</div>

<StructuredData />

<style>
  .app {
    position: relative;
    isolation: isolate;
    min-height: 100dvh;
    overflow-x: clip;
  }

  /* The 40px grid behind everything. It scrolls with the page, like the
     artboards in the design. */
  .grid-bg {
    position: absolute;
    inset: 0;
    z-index: -2;
    pointer-events: none;
    background-image:
      linear-gradient(var(--bg-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: var(--grid-opacity);
  }

  main {
    padding-top: 16px;
    outline: none;
  }

  .skip {
    position: fixed;
    z-index: 100;
    top: 8px;
    left: 8px;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--ink);
    color: var(--on-ink);
    font-family: var(--font-mono);
    font-size: 13px;
    translate: 0 -200%;
  }

  .skip:focus {
    translate: none;
  }

  @media (max-width: 1023px) {
    main {
      padding-top: 8px;
    }
  }
</style>
