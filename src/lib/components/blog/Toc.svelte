<script lang="ts">
  import { tick } from 'svelte'
  import { Spring } from 'svelte/motion'

  import { prefersReducedMotion, SPRING_UI } from '$lib/motion'
  import type { TocEntry } from './posts'

  interface Props {
    entries: TocEntry[]
    /** The id of the section being read, tracked by the page. */
    active: string
    /** `sidebar` sticks beside the article; `pill` collapses above it. */
    variant: 'sidebar' | 'pill'
  }

  let { entries, active, variant }: Props = $props()

  const COLLAPSED = 5

  const all = $derived([
    { id: 'intro', text: 'Intro', level: 2 as const },
    ...entries,
  ])
  const activeIndex = $derived(all.findIndex((entry) => entry.id === active))

  let expanded = $state(false)
  // Reading past the collapsed part opens the rest, so the marker is never
  // on an item that isn't shown.
  $effect(() => {
    if (activeIndex > COLLAPSED) expanded = true
  })

  const shown = $derived(
    expanded || variant === 'pill' ? all : all.slice(0, COLLAPSED + 1)
  )
  const hiddenCount = $derived(all.length - shown.length)

  // The active marker (green edge, raised background) slides between items.
  let list = $state<HTMLElement>()
  const marker = new Spring({ y: 0, h: 0 }, SPRING_UI)
  let placed = $state(false)

  $effect(() => {
    void active
    void shown.length
    if (variant !== 'sidebar' || !list) return
    tick().then(() => {
      const link = list?.querySelector<HTMLElement>('[aria-current="location"]')
      if (!link) return
      marker.set(
        { y: link.offsetTop, h: link.offsetHeight },
        { instant: !placed || prefersReducedMotion.current }
      )
      placed = true
    })
  })

  const activeText = $derived(all[activeIndex]?.text ?? 'Intro')

  let details = $state<HTMLDetailsElement>()
</script>

{#snippet items()}
  {#each shown as entry (entry.id)}
    <li>
      <a
        href="#{entry.id}"
        class="item"
        class:sub={entry.level === 3}
        aria-current={entry.id === active ? 'location' : undefined}
        onclick={() => details && (details.open = false)}
      >
        {entry.text}
      </a>
    </li>
  {/each}
{/snippet}

{#if variant === 'sidebar'}
  <nav class="toc" aria-labelledby="toc-title">
    <h2 id="toc-title" class="label">ON THIS PAGE</h2>
    <ol bind:this={list} class="list">
      {#if placed}
        <span
          class="marker"
          aria-hidden="true"
          style:transform="translateY({marker.current.y}px)"
          style:height="{marker.current.h}px"
        ></span>
      {/if}
      {@render items()}
      {#if hiddenCount > 0}
        <li>
          <button
            type="button"
            class="item more"
            onclick={() => (expanded = true)}
          >
            … {hiddenCount} more
          </button>
        </li>
      {/if}
    </ol>
  </nav>
{:else}
  <details class="pill" bind:this={details}>
    <summary>
      <span class="pill-label">On this page</span>
      <span class="pill-current">{activeText}</span>
    </summary>
    <ol class="list pill-list">
      {@render items()}
    </ol>
  </details>
{/if}

<style>
  .toc {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .label {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.12em;
    color: var(--ink-4);
  }

  .list {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .item {
    position: relative;
    z-index: 1;
    display: block;
    width: 100%;
    padding: 6px 10px;
    border-left: 2px solid var(--border);
    border-radius: 8px;
    color: var(--ink-3);
    font: inherit;
    text-align: left;
    line-height: 1.4;
    transition: color var(--dur-1) linear;
  }

  .item:hover,
  .item[aria-current='location'] {
    color: var(--ink);
  }

  .item.sub {
    padding-left: 22px;
    font-size: 12px;
  }

  .more {
    color: var(--ink-4);
  }

  /* Until hydration the active item marks itself; then the sliding marker
     takes over. */
  .list:not(:has(.marker)) .item[aria-current='location'] {
    border-left-color: var(--green);
    background: var(--surface);
  }

  .marker {
    position: absolute;
    z-index: 2;
    left: 0;
    top: 0;
    width: 100%;
    border-left: 2px solid var(--green);
    border-radius: 8px;
    background: var(--surface);
    pointer-events: none;
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
  }

  /* The marker paints over the item's own grey edge; text stays on top. */
  .list :global(li) {
    position: relative;
  }

  .item[aria-current='location'] {
    z-index: 3;
    border-left-color: transparent;
  }

  .list:not(:has(.marker)) .item[aria-current='location'] {
    border-left-color: var(--green);
  }

  .pill {
    border-radius: 14px;
    border: 1px solid var(--border-strong);
    background: var(--surface);
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .pill summary {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 10px 14px;
    cursor: pointer;
    list-style: none;
  }

  .pill summary::-webkit-details-marker {
    display: none;
  }

  .pill summary::after {
    content: '▾';
    margin-left: auto;
    color: var(--ink-4);
    transition: rotate var(--dur-2) var(--ease-out);
  }

  .pill[open] summary::after {
    rotate: 180deg;
  }

  .pill-label {
    flex: none;
    color: var(--ink-3);
  }

  .pill-current {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ink);
  }

  .pill-list {
    max-height: 50vh;
    overflow-y: auto;
    padding: 0 10px 12px;
  }

  .pill-list .item[aria-current='location'] {
    border-left-color: var(--green);
    background: var(--surface-muted);
  }
</style>
