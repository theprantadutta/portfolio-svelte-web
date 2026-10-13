import type { Action } from 'svelte/action'

import { isBelowFold } from '.'

interface RevealOptions {
  /** Stagger the element's children instead of fading the element itself. */
  stagger?: boolean
  /** Extra delay in ms before the reveal starts. */
  delay?: number
}

/**
 * Fades an element up 16px the first time it scrolls into view (MOTION §5).
 *
 * Only elements that start below the fold are armed (hidden). Anything
 * already on screen at mount is left alone, so a reveal can never blank out
 * what the reader is looking at, and without JavaScript nothing is armed at
 * all. The keyframes live in app.css under [data-reveal].
 *
 * The observer uses threshold 0 rather than a ratio on purpose: a ratio is
 * measured against the element's own area, so a container many times taller
 * than the viewport could never reach it and would stay hidden.
 */
export const reveal: Action<HTMLElement, RevealOptions | undefined> = (
  node,
  options
) => {
  if (!isBelowFold(node)) return

  if (options?.stagger) {
    node.dataset.stagger = ''
    Array.from(node.children).forEach((child, i) =>
      (child as HTMLElement).style.setProperty('--i', String(i))
    )
  }
  if (options?.delay) node.style.setProperty('--d', `${options.delay}ms`)

  node.dataset.reveal = 'armed'

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      node.dataset.reveal = 'in'
      observer.disconnect()
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 }
  )
  observer.observe(node)

  return {
    destroy: () => observer.disconnect(),
  }
}
