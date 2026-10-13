<script lang="ts">
  import Search from '@lucide/svelte/icons/search'
  import { tick } from 'svelte'
  import { cubicInOut } from 'svelte/easing'
  import { page } from '$app/state'

  import ThemeToggle from '#components/chrome/ThemeToggle.svelte'
  import Avatar from '#components/ui/Avatar.svelte'
  import { ui } from '#lib/context/ui.svelte.js'
  import { profile, socials } from '#lib/data/profile.js'
  import { prefersReducedMotion } from '#lib/motion/index.js'
  import { siteIndex } from '#lib/site-index.svelte.js'
  import { SITE_ROUTES, routeFor, type RouteId } from '#lib/site-nav.js'
  import { lockScroll, unlockScroll } from '#lib/smooth-scroll.js'

  const active = $derived(routeFor(page.url.pathname))

  const meta = $derived.by((): Partial<Record<RouteId, string>> => {
    const counts = siteIndex.data?.counts
    return {
      about: 'readme',
      projects: counts ? String(counts.projects) : '',
      'open-source': counts ? `${counts.prs} PRs` : '',
      blog: counts ? `${counts.posts} posts` : '',
      contact: profile.openToWork ? 'open' : '',
    }
  })

  const footerSocials = socials.filter((social) => social.id !== 'email')

  let sheet = $state<HTMLElement>()
  let closeButton = $state<HTMLButtonElement>()

  // The sheet grows out of the ☰ button as a circle (MOTION §4 "Mobile menu").
  const circle = (_node: Element) => {
    const { x, y } = ui.menuOrigin
    return {
      duration: prefersReducedMotion.current ? 0 : 450,
      easing: cubicInOut,
      css: (t: number) => `clip-path: circle(${t * 150}% at ${x}px ${y}px)`,
    }
  }

  $effect(() => {
    if (!ui.menuOpen) return
    lockScroll()
    siteIndex.load().catch(() => {
      // Counts are decoration: without them the rows just show no meta.
    })
    tick().then(() => closeButton?.focus())

    return () => {
      unlockScroll()
      document.querySelector<HTMLElement>('.menu-button')?.focus()
    }
  })

  const focusables = () =>
    Array.from(
      sheet?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ??
        []
    )

  const onKeydown = (event: KeyboardEvent) => {
    if (!ui.menuOpen) return
    if (event.key === 'Escape') {
      event.preventDefault()
      ui.closeMenu()
      return
    }
    if (event.key !== 'Tab') return

    // Keep focus inside the sheet while it is open.
    const items = focusables()
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // Swipe down to dismiss.
  let touchY = 0
  let touchX = 0
  const onTouchStart = (event: TouchEvent) => {
    touchY = event.touches[0].clientY
    touchX = event.touches[0].clientX
  }
  const onTouchEnd = (event: TouchEvent) => {
    const dy = event.changedTouches[0].clientY - touchY
    const dx = Math.abs(event.changedTouches[0].clientX - touchX)
    if (dy > 90 && dx < 60) ui.closeMenu()
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if ui.menuOpen}
  <div
    bind:this={sheet}
    id="mobile-menu"
    class="sheet"
    role="dialog"
    aria-modal="true"
    aria-label="Site menu"
    tabindex="-1"
    transition:circle
    ontouchstart={onTouchStart}
    ontouchend={onTouchEnd}
  >
    <div class="glow green ambient" aria-hidden="true"></div>
    <div class="glow purple ambient" aria-hidden="true"></div>

    <div class="inner">
      <div class="top">
        <a class="brand" href="/" onclick={ui.closeMenu}>
          <Avatar size={30} />
          pranta/portfolio
        </a>
        <button
          bind:this={closeButton}
          type="button"
          class="close"
          onclick={ui.closeMenu}
          aria-label="Close menu"
        >
          <span class="burger" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
      </div>

      <button type="button" class="jump" onclick={ui.openPalette}>
        <Search size={15} strokeWidth={1.75} />
        jump to…
        <span class="key">/</span>
      </button>

      <nav aria-label="Site">
        <ol class="routes">
          {#each SITE_ROUTES as route, i (route.id)}
            <li style:--i={i}>
              <a
                href={route.href}
                class="route"
                aria-current={route.id === active ? 'page' : undefined}
                onclick={ui.closeMenu}
              >
                <span class="no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span class="label">{route.label}</span>
                <span class="meta">{meta[route.id] ?? ''}</span>
              </a>
            </li>
          {/each}
        </ol>
      </nav>

      <div class="footer">
        {#each footerSocials as social (social.id)}
          <a
            class="social"
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.id}
          </a>
        {/each}
        <ThemeToggle onDark />
      </div>
    </div>
  </div>
{/if}

<style>
  .sheet {
    position: fixed;
    inset: 0;
    z-index: 60;
    overflow: hidden;
    background: #15171c;
    color: #ecedf0;
  }

  .glow {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .glow.green {
    width: 420px;
    height: 420px;
    left: -140px;
    bottom: -160px;
    background: radial-gradient(
      circle,
      oklch(0.6 0.15 150 / 0.5),
      transparent 65%
    );
    animation: drift 12s ease-in-out infinite;
  }

  .glow.purple {
    width: 380px;
    height: 380px;
    right: -160px;
    top: 120px;
    background: radial-gradient(
      circle,
      oklch(0.6 0.15 300 / 0.4),
      transparent 65%
    );
    animation: drift2 14s ease-in-out infinite;
  }

  .inner {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18px;
    height: 100%;
    overflow-y: auto;
    padding: max(10px, env(safe-area-inset-top)) var(--gutter)
      max(20px, env(safe-area-inset-bottom));
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    margin-top: 0;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .close {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #ecedf0;
    color: #15171c;
  }

  /* ☰ morphs into ✕: the outer lines rotate in, the middle one fades. */
  .burger {
    position: relative;
    width: 16px;
    height: 12px;
  }

  .burger i {
    position: absolute;
    left: 0;
    width: 16px;
    height: 1.75px;
    border-radius: 1px;
    background: currentColor;
  }

  .burger i:nth-child(1) {
    top: 0;
    animation: line-top 450ms var(--ease-in-out) both;
  }

  .burger i:nth-child(2) {
    top: 5px;
    animation: line-mid 450ms var(--ease-in-out) both;
  }

  .burger i:nth-child(3) {
    top: 10px;
    animation: line-bottom 450ms var(--ease-in-out) both;
  }

  @keyframes line-top {
    to {
      translate: 0 5px;
      rotate: 45deg;
    }
  }

  @keyframes line-mid {
    to {
      opacity: 0;
    }
  }

  @keyframes line-bottom {
    to {
      translate: 0 -5px;
      rotate: -45deg;
    }
  }

  .jump {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 46px;
    padding: 13px 14px;
    border-radius: 12px;
    background: #1f2127;
    border: 1px solid #2a2c33;
    font-family: var(--font-mono);
    font-size: 13px;
    color: #8b8e97;
    text-align: left;
  }

  .key {
    margin-left: auto;
    padding: 1px 6px;
    border-radius: 4px;
    background: #2a2c33;
  }

  .routes {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .routes li {
    animation: rise 450ms var(--ease-out) calc(120ms + var(--i) * 45ms) both;
    --rise: 20px;
  }

  .route {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 13px 4px;
    border-bottom: 1px solid #22242a;
    color: #8b8e97;
  }

  .route[aria-current='page'] {
    color: #ecedf0;
  }

  .no {
    font-family: var(--font-mono);
    font-size: 12px;
    color: #5d6068;
    /* The numbers type in, two characters at a time. */
    animation: type-in 240ms steps(2, end) calc(200ms + var(--i) * 45ms) both;
  }

  @keyframes type-in {
    from {
      clip-path: inset(0 100% 0 0);
    }
  }

  .label {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    font-family: var(--font-mono);
    font-size: 11px;
    color: #8b8e97;
  }

  .footer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 44px;
    gap: 8px;
    margin-top: auto;
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .social {
    display: grid;
    place-items: center;
    min-height: 44px;
    padding: 13px 4px;
    border-radius: 12px;
    background: #1f2127;
  }

  @media (min-width: 1024px) {
    .sheet {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .routes li,
    .no,
    .burger i {
      animation-duration: 1ms !important;
      animation-delay: 0ms !important;
    }
  }
</style>
