<script lang="ts">
  import { onMount } from 'svelte'

  let { target }: { target: HTMLElement | undefined } = $props()

  /**
   * The 3px bar across the very top of a post (MOTION §4 "Blog post"):
   * signature gradient, scaled to how much of the article has scrolled past.
   * Measured once per frame from the article's own box, so images loading in
   * and changing its height are accounted for on the next scroll.
   */
  let progress = $state(0)

  onMount(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      if (!target) return
      const rect = target.getBoundingClientRect()
      const travel = rect.height - window.innerHeight * 0.6
      const passed = -rect.top + window.innerHeight * 0.2
      progress = travel > 0 ? Math.min(Math.max(passed / travel, 0), 1) : 1
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  })
</script>

<div class="track" aria-hidden="true">
  <div class="fill" style:transform="scaleX({progress})"></div>
</div>

<style>
  .track {
    position: fixed;
    z-index: 50;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--bg-grid);
    pointer-events: none;
  }

  .fill {
    height: 100%;
    background: var(--grad-progress);
    transform-origin: left;
  }
</style>
