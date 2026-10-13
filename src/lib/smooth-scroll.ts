import type Lenis from 'lenis'

import { finePointer, prefersReducedMotion } from '$lib/motion'

/**
 * Lenis smooth scrolling for desktop pointers (MOTION §5): `lerp: 0.1`, smooth
 * wheel, anchor links landing 72px below the sticky nav. Touch keeps native
 * scrolling, and reduced motion keeps it everywhere.
 *
 * Lenis drives the real window scroll position, so SvelteKit's scroll
 * restoration and every `scroll` listener keep working unchanged. It is
 * imported only where it will run, so phones never download it.
 */
let lenis: Lenis | null = null
let locks = 0

export const startSmoothScroll = async () => {
  if (lenis || !finePointer() || prefersReducedMotion.current) return () => {}

  const { default: Lenis } = await import('lenis')
  const instance = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    anchors: { offset: -72 },
    autoRaf: true,
    // Anything that scrolls on its own (code blocks, the palette's list, the
    // heatmap on narrow screens) keeps its native wheel behaviour.
    allowNestedScroll: true,
  })
  lenis = instance
  if (locks > 0) instance.stop()

  return () => {
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

/** Jumps without easing, e.g. after a client-side navigation. */
export const resetSmoothScroll = () =>
  lenis?.scrollTo(window.scrollY, { immediate: true })

/**
 * Freezes page scrolling while an overlay (menu, palette) is open. Counted,
 * so two overlays can overlap without the first to close unlocking the page.
 */
export const lockScroll = () => {
  locks++
  if (locks > 1) return
  lenis?.stop()
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  document.documentElement.style.setProperty(
    '--scrollbar-gap',
    `${scrollbar}px`
  )
  document.documentElement.dataset.scrollLocked = ''
}

export const unlockScroll = () => {
  locks = Math.max(0, locks - 1)
  if (locks > 0) return
  delete document.documentElement.dataset.scrollLocked
  lenis?.start()
}
