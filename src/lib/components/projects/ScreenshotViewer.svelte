<script lang="ts">
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import X from '@lucide/svelte/icons/x'
  import { tick } from 'svelte'
  import { fly } from 'svelte/transition'

  import { prefersReducedMotion } from '#lib/motion/index.js'
  import type { Screenshot } from '#lib/projects.js'
  import { lockScroll, unlockScroll } from '#lib/smooth-scroll.js'

  interface Props {
    title: string
    screenshots: Screenshot[]
  }

  let { title, screenshots }: Props = $props()

  /**
   * Full-screen screenshot viewer on a native modal <dialog>: the top layer
   * keeps it clear of every ancestor's transform, and focus trapping, Esc
   * and the inert page come with it. The dialog sets its own size and
   * margin, because the CSS reset's `margin: 0` is what used to strand the
   * old lightbox in the top-left corner.
   */
  let dialog = $state<HTMLDialogElement>()
  let strip = $state<HTMLElement>()
  let index = $state(0)
  /** Which way the last step went, so the image slides in from that side. */
  let direction = $state(1)

  const count = $derived(screenshots.length)
  const current = $derived(screenshots[index])
  const pad = (n: number) => String(n).padStart(2, '0')

  let locked = false

  export const open = (start: number) => {
    index = start
    direction = 1
    dialog?.showModal()
    if (!locked) lockScroll()
    locked = true
    void centreThumb()
  }

  const close = () => dialog?.close()

  const release = () => {
    if (locked) unlockScroll()
    locked = false
  }

  // Leaving the page with the viewer open never fires `close`.
  $effect(() => release)

  const go = (next: number) => {
    if (count < 2) return
    direction = next > index ? 1 : -1
    index = (next + count) % count
    void centreThumb()
  }

  const centreThumb = async () => {
    await tick()
    strip
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }

  // Warm the cache for both neighbours so stepping never waits on a fetch.
  $effect(() => {
    if (count < 2) return
    for (const offset of [1, -1]) {
      const shot = screenshots[(index + offset + count) % count]
      const preload = new Image()
      preload.sizes = '100vw'
      if (shot.srcset) preload.srcset = shot.srcset
      preload.src = shot.url
    }
  })

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(index + 1)
    else if (event.key === 'ArrowLeft') go(index - 1)
    else if (event.key === 'Home') go(0)
    else if (event.key === 'End') go(count - 1)
    else return
    event.preventDefault()
  }

  // Swipe sideways to step, down to close.
  let start: { x: number; y: number } | null = null
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse')
      start = { x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event: PointerEvent) => {
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    start = null
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
      go(index + (dx < 0 ? 1 : -1))
    else if (dy > 90 && dy > Math.abs(dx)) close()
  }

  // A click on the dark area around the image closes, like any lightbox.
  const onStageClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) close()
  }

  const slide = (node: Element) =>
    fly(node, {
      x: prefersReducedMotion.current ? 0 : direction * 28,
      duration: prefersReducedMotion.current ? 0 : 220,
      opacity: 0,
    })
</script>

<dialog
  bind:this={dialog}
  class="viewer"
  aria-label="{title} screenshots"
  onkeydown={onKeydown}
  onclose={release}
>
  <header class="bar">
    <p class="where">
      <span class="name">{title}</span>
      <span class="count tabular" aria-live="polite">
        {pad(index + 1)} / {pad(count)}
      </span>
    </p>
    <button type="button" class="icon" onclick={close} aria-label="Close">
      <X size={20} strokeWidth={1.75} />
    </button>
  </header>

  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    class="stage"
    onclick={onStageClick}
    onpointerdown={onPointerDown}
    onpointerup={onPointerUp}
    onpointercancel={() => (start = null)}
  >
    {#if current}
      {#key index}
        <img
          in:slide
          src={current.url}
          srcset={current.srcset}
          sizes="(max-width: 767px) 100vw, 80vw"
          alt={current.caption ?? `${title} screenshot ${index + 1}`}
          width={current.width}
          height={current.height}
          draggable="false"
        />
      {/key}
    {/if}

    {#if count > 1}
      <button
        type="button"
        class="icon step prev"
        onclick={() => go(index - 1)}
        aria-label="Previous screenshot"
      >
        <ChevronLeft size={22} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        class="icon step next"
        onclick={() => go(index + 1)}
        aria-label="Next screenshot"
      >
        <ChevronRight size={22} strokeWidth={1.75} />
      </button>
    {/if}
  </div>

  <footer class="foot">
    <p class="caption">{current?.caption ?? ''}</p>
    {#if count > 1}
      <div class="strip" bind:this={strip}>
        {#each screenshots as shot, i (shot.url)}
          <button
            type="button"
            class="thumb"
            aria-label="Screenshot {i + 1}"
            aria-current={i === index}
            onclick={() => go(i)}
          >
            <img
              src={shot.url}
              srcset={shot.srcset}
              sizes="64px"
              alt=""
              width={shot.width}
              height={shot.height}
              loading="lazy"
              decoding="async"
            />
          </button>
        {/each}
      </div>
    {/if}
  </footer>
</dialog>

<style>
  /* Dark in both themes, like every photo viewer: the screenshots are the
     only light on screen. */
  .viewer {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: #ecedf0;
    overflow: hidden;
  }

  .viewer[open] {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    animation: viewer-in 220ms var(--ease-out);
  }

  .viewer::backdrop {
    background: rgb(8 9 11 / 0.94);
    backdrop-filter: blur(6px);
  }

  @keyframes viewer-in {
    from {
      opacity: 0;
    }
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: max(12px, env(safe-area-inset-top)) var(--gutter) 8px;
  }

  .where {
    display: flex;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #ecedf0;
  }

  .count {
    flex: none;
    color: #8b8e97;
  }

  .icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.08);
    color: #ecedf0;
    transition: background-color var(--dur-1) linear;
  }

  .icon:hover {
    background: rgb(255 255 255 / 0.16);
  }

  .stage {
    position: relative;
    min-height: 0;
    touch-action: pan-y;
    --inset-x: 76px;
    --inset-y: 8px;
  }

  /* Centred and scaled down to fit the stage, never up. The stage's height
     is definite (the dialog's 1fr row), so these percentages resolve, which
     they would not on an auto-height grid item. */
  .stage img {
    position: absolute;
    inset: 0;
    margin: auto;
    width: auto;
    height: auto;
    max-width: calc(100% - 2 * var(--inset-x));
    max-height: calc(100% - 2 * var(--inset-y));
    border-radius: 16px;
    box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.7);
    user-select: none;
  }

  .step {
    position: absolute;
    top: 50%;
    width: 48px;
    height: 48px;
    translate: 0 -50%;
  }

  .prev {
    left: var(--gutter);
  }

  .next {
    right: var(--gutter);
  }

  .foot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 6px var(--gutter) max(14px, env(safe-area-inset-bottom));
  }

  .caption {
    min-height: 1.4em;
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    color: #c9cbd1;
    text-align: center;
  }

  .strip {
    display: flex;
    gap: 8px;
    max-width: 100%;
    padding: 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .thumb {
    flex: none;
    height: 64px;
    overflow: hidden;
    border-radius: 8px;
    opacity: 0.45;
    outline: 2px solid transparent;
    outline-offset: 2px;
    transition:
      opacity var(--dur-1) linear,
      outline-color var(--dur-1) linear;
  }

  .thumb:hover {
    opacity: 0.8;
  }

  .thumb[aria-current='true'] {
    opacity: 1;
    outline-color: #ecedf0;
  }

  .thumb img {
    display: block;
    width: auto;
    height: 100%;
  }

  /* Phones: the arrows give way to swiping, and the image gets the width. */
  @media (max-width: 767px) {
    .stage {
      --inset-x: 12px;
      --inset-y: 4px;
    }

    .step {
      display: none;
    }

    .thumb {
      height: 52px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .viewer[open] {
      animation: none;
    }
  }
</style>
