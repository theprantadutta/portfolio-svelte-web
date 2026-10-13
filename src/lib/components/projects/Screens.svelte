<script lang="ts">
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'

  import ScreenshotViewer from '#components/projects/ScreenshotViewer.svelte'
  import { prefersReducedMotion } from '#lib/motion/index.js'
  import type { Screenshot } from '#lib/projects.js'

  interface Props {
    title: string
    screenshots: Screenshot[]
    videos: { url: string; mime: string }[]
  }

  let { title, screenshots, videos }: Props = $props()

  /**
   * The screens tab: every screenshot in the CMS's order on one strip at a
   * shared height, like a store listing, numbered and captioned. A click
   * opens the full-screen viewer at that shot. Screen recordings follow.
   */
  let viewer = $state<ScreenshotViewer>()
  let track = $state<HTMLElement>()
  let atStart = $state(true)
  let atEnd = $state(true)

  const pad = (n: number) => String(n).padStart(2, '0')

  const measure = () => {
    if (!track) return
    atStart = track.scrollLeft <= 4
    atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
  }

  $effect(() => {
    if (!track) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  })

  const page = (direction: 1 | -1) =>
    track?.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: prefersReducedMotion.current ? 'auto' : 'smooth',
    })
</script>

{#if screenshots.length}
  <section class="screens" aria-label="{title} screenshots">
    <div class="head">
      <p class="total">
        {screenshots.length}
        {screenshots.length === 1 ? 'screenshot' : 'screenshots'}
        <span class="hint">· click one to open it</span>
      </p>
      {#if !(atStart && atEnd)}
        <div class="arrows">
          <button
            type="button"
            class="arrow"
            onclick={() => page(-1)}
            disabled={atStart}
            aria-label="Scroll screenshots left"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            class="arrow"
            onclick={() => page(1)}
            disabled={atEnd}
            aria-label="Scroll screenshots right"
          >
            <ChevronRight size={18} strokeWidth={1.75} />
          </button>
        </div>
      {/if}
    </div>

    <ol
      class="track"
      class:fade-start={!atStart}
      class:fade-end={!atEnd}
      bind:this={track}
      onscroll={measure}
    >
      {#each screenshots as shot, i (shot.url)}
        <li class="item">
          <button
            type="button"
            class="shot"
            style:aspect-ratio="{shot.width} / {shot.height}"
            onclick={() => viewer?.open(i)}
            aria-label="Open screenshot {i +
              1} of {screenshots.length}{shot.caption
              ? `: ${shot.caption}`
              : ''}"
          >
            <img
              src={shot.url}
              srcset={shot.srcset}
              sizes="(max-width: 767px) 60vw, 260px"
              alt=""
              width={shot.width}
              height={shot.height}
              loading={i < 4 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </button>
          <p class="label">
            <span class="no tabular">{pad(i + 1)}</span>
            {#if shot.caption}<span class="caption">{shot.caption}</span>{/if}
          </p>
        </li>
      {/each}
    </ol>
  </section>

  <ScreenshotViewer bind:this={viewer} {title} {screenshots} />
{/if}

{#if videos.length}
  <section class="recordings" aria-label="{title} screen recordings">
    <p class="total">
      {videos.length}
      {videos.length === 1 ? 'recording' : 'recordings'}
    </p>
    <div class="videos">
      {#each videos as video (video.url)}
        <video controls preload="metadata" playsinline>
          <source src={video.url} type={video.mime} />
        </video>
      {/each}
    </div>
  </section>
{/if}

{#if !screenshots.length && !videos.length}
  <p class="none">No screenshots for this one yet.</p>
{/if}

<style>
  .screens,
  .recordings {
    --h: 460px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .recordings {
    margin-top: 28px;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .total {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-2);
  }

  .hint {
    color: var(--ink-4);
  }

  .arrows {
    display: flex;
    gap: 8px;
  }

  .arrow {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid var(--border-strong);
    background: var(--surface);
    color: var(--ink);
    transition:
      border-color var(--dur-1) linear,
      opacity var(--dur-1) linear;
  }

  .arrow:hover:not(:disabled) {
    border-color: var(--ink);
  }

  .arrow:disabled {
    opacity: 0.35;
    cursor: default;
  }

  /* One strip at a shared height; each shot's width comes from its own
     aspect ratio, so phone and desktop screenshots sit side by side. */
  .track {
    display: flex;
    gap: 16px;
    margin: 0;
    padding: 4px 2px 6px;
    list-style: none;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 2px;
    scrollbar-width: none;
    --fade: 40px;
  }

  .track::-webkit-scrollbar {
    display: none;
  }

  .track.fade-start {
    mask-image: linear-gradient(to right, transparent, #000 var(--fade));
  }

  .track.fade-end {
    mask-image: linear-gradient(to left, transparent, #000 var(--fade));
  }

  .track.fade-start.fade-end {
    mask-image: linear-gradient(
      to right,
      transparent,
      #000 var(--fade),
      #000 calc(100% - var(--fade)),
      transparent
    );
  }

  .item {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-snap-align: start;
  }

  .shot {
    display: block;
    height: var(--h);
    max-width: min(78vw, 820px);
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--surface-muted);
    box-shadow: 0 18px 36px -28px rgb(0 0 0 / 0.45);
    transition:
      transform var(--dur-2) var(--ease-out),
      box-shadow var(--dur-2) var(--ease-out);
  }

  .shot img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .label {
    display: flex;
    gap: 8px;
    max-width: 100%;
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
  }

  .no {
    flex: none;
    font-family: var(--font-mono);
    color: var(--ink-4);
  }

  .caption {
    color: var(--ink-2);
  }

  /* The caption wraps within its shot's width instead of widening it. */
  .item {
    width: min-content;
  }

  .videos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .videos video {
    display: block;
    width: 100%;
    max-height: var(--h);
    border-radius: 18px;
    border: 1px solid var(--border);
    background: #000;
  }

  .none {
    margin: 0;
    padding: 24px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-3);
  }

  @media (hover: hover) {
    .shot:hover {
      transform: translateY(-3px);
      box-shadow: 0 24px 44px -28px rgb(0 0 0 / 0.55);
    }
  }

  @media (max-width: 767px) {
    .screens,
    .recordings {
      --h: 380px;
    }

    .hint,
    .arrows {
      display: none;
    }

    .track {
      gap: 12px;
      margin-inline: calc(var(--gutter) * -1);
      padding-inline: var(--gutter);
      scroll-padding-inline: var(--gutter);
      mask-image: none;
    }

    .track.fade-start,
    .track.fade-end,
    .track.fade-start.fade-end {
      mask-image: none;
    }

    .shot {
      border-radius: 16px;
    }
  }
</style>
