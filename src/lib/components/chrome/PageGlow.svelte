<script lang="ts" module>
  export type GlowHue = 'green' | 'blue' | 'purple' | 'orange'

  export interface Glow {
    hue: GlowHue
    width: number
    height: number
    /** CSS offsets from the page's edges, e.g. { right: -100, top: -200 } */
    top?: number
    right?: number
    bottom?: number
    left?: number
    /** Which drift loop, and how long one cycle takes (MOTION §1). */
    drift?: 1 | 2
    duration?: number
    /** Overrides the default gradient alpha, for the brighter contact glow. */
    alpha?: number
    /** Only drawn in the dark theme (the home page's second glow). */
    darkOnly?: boolean
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'

  import { finePointer, prefersReducedMotion } from '$lib/motion'
  import { ambient } from '$lib/motion/ambient'

  let { glows }: { glows: Glow[] } = $props()

  /**
   * The ambient blobs behind each page. Soft edges come from the gradient's
   * own falloff rather than `filter: blur()`, which is expensive at this size
   * (CLAUDE_CODE_PROMPT, "Glows").
   *
   * On desktop they also drift at 0.3× the scroll speed (MOTION §5 parallax).
   * The offset is written to one CSS variable per frame, and only where a
   * fine pointer suggests the GPU can spare it.
   */
  let layer: HTMLElement

  onMount(() => {
    if (!finePointer() || prefersReducedMotion.current) return
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        layer.style.setProperty('--parallax', `${window.scrollY * 0.3}px`)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  })

  const px = (value?: number) =>
    value === undefined ? undefined : `${value}px`
</script>

<div class="layer" aria-hidden="true" bind:this={layer}>
  {#each glows as glow, i (i)}
    <div
      class="glow ambient"
      class:dark-only={glow.darkOnly}
      use:ambient
      style:width="{glow.width}px"
      style:height="{glow.height}px"
      style:top={px(glow.top)}
      style:right={px(glow.right)}
      style:bottom={px(glow.bottom)}
      style:left={px(glow.left)}
      style:--glow={glow.alpha
        ? `color-mix(in oklch, var(--glow-${glow.hue}) ${glow.alpha * 100}%, transparent)`
        : `var(--glow-${glow.hue})`}
      style:animation="{glow.drift === 2 ? 'drift2' : 'drift'}
      {glow.duration ?? 14}s ease-in-out infinite"
    ></div>
  {/each}
</div>

<style>
  .layer {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }

  .glow {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(ellipse, var(--glow), transparent 65%);
    translate: 0 var(--parallax, 0px);
    will-change: transform;
  }

  .dark-only {
    display: none;
  }

  :global([data-theme='dark']) .dark-only {
    display: block;
  }

  /* Phones get smaller blobs so they read as a tint, not a stain. */
  @media (max-width: 767px) {
    .glow {
      scale: 0.6;
    }
  }
</style>
