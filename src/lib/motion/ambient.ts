import type { Action } from 'svelte/action'

/**
 * Pauses an element's CSS loops (glow drift, shimmer, heatmap sweep) while it
 * is offscreen or the tab is in the background (MOTION §0 performance
 * budget). Sets data-paused, which app.css turns into animation-play-state.
 */
export const ambient: Action<HTMLElement> = (node) => {
  let visible = true

  const sync = () => {
    if (visible && !document.hidden) delete node.dataset.paused
    else node.dataset.paused = ''
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
      sync()
    },
    { rootMargin: '100px' }
  )
  observer.observe(node)
  document.addEventListener('visibilitychange', sync)

  return {
    destroy: () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    },
  }
}
