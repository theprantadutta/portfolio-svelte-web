<script lang="ts">
  import { onMount } from 'svelte'

  import { easeOut, isBelowFold, prefersReducedMotion } from '$lib/motion'

  interface Props {
    value: number
    prefix?: string
    suffix?: string
    /** ms after mount before counting, when already on screen */
    delay?: number
    duration?: number
    /** Group thousands with commas: 2148 → "2,148" */
    grouped?: boolean
  }

  let {
    value,
    prefix = '',
    suffix = '',
    delay = 0,
    duration = 900,
    grouped = true,
  }: Props = $props()

  /**
   * Counts from zero to `value` (MOTION §2, step 7). The prerendered HTML
   * already holds the final number, so without JavaScript, with reduced
   * motion, or when hydration lands late enough that the number has
   * already been read, it simply stays put.
   */
  // null until animating, so the prerendered final value shows meanwhile
  let shown = $state<number | null>(null)
  let node: HTMLElement

  const format = (n: number) =>
    grouped ? Math.round(n).toLocaleString('en-US') : String(Math.round(n))

  onMount(() => {
    if (prefersReducedMotion.current || value === 0) return

    const offscreen = isBelowFold(node)
    // On screen and the page has been readable for a while: leave it.
    if (!offscreen && performance.now() > 1500) return

    let frame = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let observer: IntersectionObserver | undefined

    const run = (wait: number) => {
      shown = 0
      timer = setTimeout(() => {
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          shown = value * easeOut(t)
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      }, wait)
    }

    if (offscreen) {
      shown = 0
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          observer?.disconnect()
          run(0)
        },
        { rootMargin: '0px 0px -10% 0px' }
      )
      observer.observe(node)
    } else {
      run(delay)
    }

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      observer?.disconnect()
    }
  })
</script>

<span class="tabular" bind:this={node}
  ><span class="sr-only">{prefix}{format(value)}{suffix}</span><span
    aria-hidden="true">{prefix}{format(shown ?? value)}{suffix}</span
  ></span
>
