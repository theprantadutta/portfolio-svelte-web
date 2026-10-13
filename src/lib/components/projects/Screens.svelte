<script lang="ts">
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import X from '@lucide/svelte/icons/x'

  import type { ImageRef } from '#lib/projects.js'

  interface Props {
    title: string
    screenshots: ImageRef[]
    videos: { url: string; mime: string }[]
  }

  let { title, screenshots, videos }: Props = $props()

  /**
   * Every screenshot, then any screen recordings. Clicking a screenshot
   * opens it large in a native <dialog>, which brings focus trapping, Esc to
   * close and the inert page behind it for free. It is portalled to <body>
   * by showModal(), so no ancestor's transform or filter can clip it.
   */
  let dialog: HTMLDialogElement
  let index = $state(0)

  const open = (i: number) => {
    index = i
    dialog.showModal()
  }

  const step = (delta: number) => {
    index = (index + delta + screenshots.length) % screenshots.length
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') step(1)
    if (event.key === 'ArrowLeft') step(-1)
  }

  const current = $derived(screenshots[index])
</script>

{#if screenshots.length || videos.length}
  <div class="screens">
    {#each screenshots as shot, i (shot.url)}
      <button
        type="button"
        class="shot"
        onclick={() => open(i)}
        aria-label="Open screenshot {i + 1} of {screenshots.length}"
      >
        <img
          src={shot.url}
          srcset={shot.srcset}
          sizes="(max-width: 767px) 45vw, 220px"
          alt="{title} screenshot {i + 1}"
          width={shot.width}
          height={shot.height}
          loading="lazy"
          decoding="async"
        />
      </button>
    {/each}
    {#each videos as video (video.url)}
      <video class="shot video" controls preload="metadata" playsinline>
        <source src={video.url} type={video.mime} />
      </video>
    {/each}
  </div>
{:else}
  <p class="none">No screenshots for this one yet.</p>
{/if}

<dialog
  bind:this={dialog}
  class="lightbox"
  aria-label="{title} screenshots"
  onkeydown={onKeydown}
>
  {#if current}
    <img
      src={current.url}
      srcset={current.srcset}
      sizes="min(90vw, 480px)"
      alt="{title} screenshot {index + 1}"
      width={current.width}
      height={current.height}
    />
  {/if}
  <div class="controls">
    {#if screenshots.length > 1}
      <button
        type="button"
        onclick={() => step(-1)}
        aria-label="Previous screenshot"
      >
        <ChevronLeft size={18} strokeWidth={1.75} />
      </button>
      <span class="counter tabular">{index + 1} / {screenshots.length}</span>
      <button
        type="button"
        onclick={() => step(1)}
        aria-label="Next screenshot"
      >
        <ChevronRight size={18} strokeWidth={1.75} />
      </button>
    {/if}
    <button type="button" onclick={() => dialog.close()} aria-label="Close">
      <X size={18} strokeWidth={1.75} />
    </button>
  </div>
</dialog>

<style>
  .screens {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }

  .shot {
    display: block;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: var(--surface-muted);
    transition:
      transform var(--dur-3) var(--ease-out),
      border-color var(--dur-3) var(--ease-out);
  }

  .shot:hover {
    transform: translateY(-3px);
    border-color: color-mix(in oklch, var(--ink) 20%, var(--border));
  }

  .shot img,
  .video {
    display: block;
    width: 100%;
    height: auto;
  }

  .none {
    margin: 0;
    padding: 24px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-3);
  }

  .lightbox {
    max-width: min(92vw, 520px);
    max-height: 92dvh;
    padding: 0;
    border: 0;
    border-radius: 24px;
    background: transparent;
    overflow: visible;
  }

  .lightbox::backdrop {
    background: rgb(10 11 13 / 0.78);
    backdrop-filter: blur(8px);
  }

  .lightbox img {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: calc(92dvh - 72px);
    margin-inline: auto;
    border-radius: 20px;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
  }

  .controls button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #1f2127;
    color: #ecedf0;
  }

  .counter {
    min-width: 64px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: #ecedf0;
    text-align: center;
  }
</style>
