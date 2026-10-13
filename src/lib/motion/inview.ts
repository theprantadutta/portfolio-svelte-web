import type { Action } from 'svelte/action'

interface InViewOptions {
  /** Called once, the first time the element enters the viewport. */
  enter: () => void
  rootMargin?: string
}

/**
 * Runs a callback the first time an element scrolls into view.
 *
 * For one-shot effects that are more than a fade (lane lines drawing, diff
 * blocks filling, numbers counting up). Those components render their final
 * state on the server and only rewind to the start when they mount
 * offscreen, so the prerendered page is complete without JavaScript.
 */
export const inview: Action<HTMLElement, InViewOptions> = (node, options) => {
  let current = options

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      current.enter()
    },
    { rootMargin: options.rootMargin ?? '0px 0px -10% 0px', threshold: 0 }
  )
  observer.observe(node)

  return {
    update: (next) => {
      current = next
    },
    destroy: () => observer.disconnect(),
  }
}
