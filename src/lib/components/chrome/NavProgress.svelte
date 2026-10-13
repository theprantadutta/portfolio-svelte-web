<script lang="ts">
  import { Tween } from 'svelte/motion'
  import { navigating } from '$app/state'

  import { easeOut } from '$lib/motion'

  /**
   * The terminal-style loading bar on link clicks (MOTION §3): it creeps to
   * 80% while the next page loads, then completes and fades. Pages are
   * prerendered, so most navigations finish before the 120ms grace period
   * and the bar never appears at all.
   */
  const progress = new Tween(0, { easing: easeOut })
  let visible = $state(false)

  $effect(() => {
    if (!navigating.to) return

    const show = setTimeout(() => {
      visible = true
      progress.set(0, { duration: 0 })
      progress.set(0.8, { duration: 1600 })
    }, 120)

    return () => {
      clearTimeout(show)
      if (!visible) return
      progress.set(1, { duration: 160 }).then(() => {
        visible = false
        progress.set(0, { duration: 0 })
      })
    }
  })
</script>

<div
  class="bar"
  class:visible
  aria-hidden="true"
  style:transform="scaleX({progress.current})"
></div>

<style>
  .bar {
    position: fixed;
    z-index: 90;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--grad-progress);
    transform-origin: left;
    opacity: 0;
    transition: opacity 200ms linear;
    pointer-events: none;
  }

  .bar.visible {
    opacity: 1;
  }
</style>
